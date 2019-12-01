import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContext, CanActivate, Injectable } from '@nestjs/common';

import { User } from '@leaa/common/src/entrys';
import { errorUtil } from '@leaa/api/src/utils';
import { IPermissionSlug } from '@leaa/common/src/interfaces';
import { PermissionsMetadataKey } from '@leaa/api/src/decorators';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  protected getUser(context: ExecutionContext): User {
    const ctx = GqlExecutionContext.create(context).getContext();

    return ctx && ctx.user;
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const permissions = this.reflector.get<IPermissionSlug[]>(PermissionsMetadataKey, context.getHandler());

    const user = this.getUser(context);

    if (!user) return errorUtil.ILLEGAL_USER();
    if (!user.flatePermissions || user.flatePermissions.length <= 0) return errorUtil.NOT_AUTH();

    return (
      user.flatePermissions &&
      user.flatePermissions.some(permission => permissions.includes(permission as IPermissionSlug))
    );
  }
}