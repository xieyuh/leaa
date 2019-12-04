import _ from 'lodash';
import xss from 'xss';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request } from 'express';
import { Injectable, CacheKey } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticationError } from 'apollo-server-core';

import { User } from '@leaa/common/src/entrys';
import { AuthLoginInput, AuthSignupInput } from '@leaa/common/src/dtos/auth';
import { IJwtPayload } from '@leaa/common/src/interfaces';
import { ConfigService } from '@leaa/api/src/modules/config/config.service';
import { errorUtil } from '@leaa/api/src/utils';
import { UserService } from '@leaa/api/src/modules/user/user.service';
import { permissionConfig } from '@leaa/api/src/configs';
import { OauthService } from '@leaa/api/src/modules/oauth/oauth.service';
import { UserProperty } from '@leaa/api/src/modules/user/user.property';

const CONSTRUCTOR_NAME = 'AuthService';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly oauthService: OauthService,
    private readonly userProperty: UserProperty,
  ) {}

  async createToken(user: User): Promise<{ authExpiresIn: number; authToken: string }> {
    const jwtPayload: IJwtPayload = { id: user.id };

    // https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
    const authExpiresIn = this.configService.SERVER_COOKIE_EXPIRES_DAY * (60 * 60 * 24);
    const authToken = await this.jwtService.sign(jwtPayload, { expiresIn: authExpiresIn });

    return {
      authExpiresIn,
      authToken,
    };
  }

  getUserPayload(token?: string): IJwtPayload {
    if (!token) throw new AuthenticationError('Header missing Authorization');

    let tokenWithoutBearer = token;

    if (token.slice(0, 6) === 'Bearer') {
      tokenWithoutBearer = token.slice(7);
    } else {
      throw new AuthenticationError('Header include incorrect Bearer prefix');
    }

    let payload;

    try {
      payload = jwt.verify(tokenWithoutBearer, this.configService.JWT_SECRET_KEY) as IJwtPayload | undefined;
    } catch (error) {
      if (error instanceof jwt.NotBeforeError) throw new AuthenticationError('Token Not Before');
      if (error instanceof jwt.TokenExpiredError) throw new AuthenticationError('Token Expired Error');
      if (error instanceof jwt.JsonWebTokenError) throw new AuthenticationError('Token Error');
    }

    return payload || errorUtil.ERROR({ error: 'Token Verify Error' });
  }

  // MUST DO minimal cost query
  // @CacheKey('validate_user')
  // @CacheTTL(20)
  async validateUserByPayload(payload: IJwtPayload): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ relations: ['roles'], where: { id: payload.id } });
    if (!user) throw new AuthenticationError('User Error');

    const flatPermissions = await this.userProperty.flatPermissions(user);

    return { ...user, flatPermissions };
  }

  async validateUserByReq(req: Request): Promise<User | undefined | boolean> {
    const isGuest = req.headers && !req.headers.authorization;

    if (req.body && isGuest && permissionConfig.notValidateUserQuerys.some(item => req.body.query.includes(item))) {
      return true;
    }

    const payload = this.getUserPayload(req.headers.authorization);

    return this.validateUserByPayload(payload);
  }

  async addTokenTouser(user: User): Promise<User> {
    const nextUser = user;
    const userAuthInfo = await this.createToken(user);

    nextUser.authToken = userAuthInfo.authToken;
    nextUser.authExpiresIn = userAuthInfo.authExpiresIn;

    return nextUser;
  }

  async login(args: AuthLoginInput): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'name', 'status', 'password'],
      where: {
        email: xss.filterXSS(args.email.trim().toLowerCase()),
      },
      // for flatPermissions
      relations: ['roles'],
    });

    if (!user) return errorUtil.ERROR({ error: `user ${args.email} does not exist` });
    if (user.status !== 1) return errorUtil.ERROR({ error: `user ${args.email} is disabled` });

    const passwordIsMatch = await bcryptjs.compareSync(args.password, user.password);
    if (!passwordIsMatch) return errorUtil.ERROR({ error: `user ${args.email} info not match` });

    delete user.password;

    return this.addTokenTouser(user);
  }

  async loginByTicket(ticket: string): Promise<User | undefined> {
    const user = await this.oauthService.getUserByTicket(ticket);

    return this.addTokenTouser(user);
  }

  async signup(args: AuthSignupInput, oid?: number): Promise<User | undefined> {
    const nextArgs: AuthSignupInput = { name: '', password: '', email: '' };

    _.forEach(args, (v, i) => {
      nextArgs[i as 'name' | 'email'] = xss.filterXSS(v || '');
    });

    if (args.password) {
      nextArgs.password = await this.userService.createPassword(args.password);
    }

    nextArgs.email = nextArgs.email.toLowerCase();

    let newUser: User;

    try {
      newUser = await this.userRepository.save({
        ...nextArgs,
        status: 1,
      });

      if (oid) {
        await this.oauthService.bindUserIdToOauth(newUser, oid);
        await this.oauthService.clearTicket(oid);
      }
    } catch (error) {
      return errorUtil.ERROR({ error: 'sign up fail...' });
    }

    return this.addTokenTouser(newUser);
  }
}
