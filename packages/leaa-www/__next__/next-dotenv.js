require('dotenv').config();

const publicRuntimeConfig = {
  NAME: process.env.NAME || '',
  NODE_ENV: process.env.NODE_ENV || 'DEV',
  PROTOCOL: process.env.PROTOCOL || 'http',
  PORT: Number(process.env.PORT) || 3333,
  //
  BASE_HOST: process.env.BASE_HOST || 'localhost',
  API_HOST: process.env.API_HOST || 'http://localhost:5555',
  GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || 'http://localhost:5555/graphql',
  UPLOAD_HOST: process.env.UPLOAD_HOST || 'http://localhost:5555/attachments',
  //
  localeSubpaths: typeof process.env.LOCALE_SUBPATHS === 'string' ? process.env.LOCALE_SUBPATHS : 'none',
};

const serverRuntimeConfig = {
  ...publicRuntimeConfig,
};

module.exports = nextConfig => ({
  ...nextConfig,
  ...{
    publicRuntimeConfig,
    serverRuntimeConfig,
  },
});