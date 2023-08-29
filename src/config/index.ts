import { bool, cleanEnv, host, num, port, str, url } from 'envalid';

import { logger } from '@/utils/utils';

/*
 following validation functions are available:

 str() - Passes string values through, will ensure a value is present unless a default value is given. Note that an empty string is considered a valid value - if this is undesirable you can easily create your own validator (see below)
 bool() - Parses env var strings "1", "0", "true", "false", "t", "f" into booleans
 num() - Parses an env var (eg. "42", "0.23", "1e5") into a Number
 email() - Ensures an env var is an email address
 host() - Ensures an env var is either a domain name or an ip address (v4 or v6)
 port() - Ensures an env var is a TCP port (1-65535)
 url() - Ensures an env var is a url with a protocol and hostname
 json() - Parses an env var with JSON.parse
 */

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production', 'staging'],
  }),

  PORT: port({ default: 3900 }),

  JWTSECRET: str({
    default: `69420lol3b682a9110ad01d1460e5e976cd5eb2d${process.env.DBHOST}${process.env.DBNAME}`,
  }),

  SETUPTYPE: str({ choices: ['local', 'aws'], default: 'local' }),

  FRONTENDURL: url(),
  BACKENDURL: url(),

  DBHOST: host(),
  DBPORT: port(),
  DBNAME: str(),
  DBUSER: str(),
  DBPASSWORD: str(),

  CINEMATIC_DBHOST: host(),
  CINEMATIC_DBPORT: port(),
  CINEMATIC_DBNAME: str(),
  CINEMATIC_DBUSER: str(),
  CINEMATIC_DBPASSWORD: str(),

  NO_REDIS: bool({ default: false }),

  REDIS_HOST: host({ default: '127.0.0.1' }),
  REDIS_PORT: port({ default: 6379 }),
  REDIS_DB: str({ default: '0' }),
  REDIS_PASSWORD: str({ default: null }),
  REDIS_PREFIX: str({ default: 'reporting' }),

  TTL_TINY: num({ default: 60, desc: 'defaults to 60 seconds' }),
  TTL_SMALL: num({ default: 360, desc: 'defaults to 6 minutes' }),
  TTL_MEDIUM: num({ default: 3600, desc: 'defaults to 60 minutes' }),
  TTL_BIG: num({ default: 21600, desc: 'defaults to 6 hours' }),

  TTL_MINUTE_1: num({ default: 60 }),
  TTL_MINUTE_2: num({ default: 120 }),
  TTL_MINUTE_6: num({ default: 300 }),
  TTL_MINUTE_12: num({ default: 720 }),
  TTL_MINUTE_30: num({ default: 1800 }),

  TTL_HOUR_1: num({ default: 3600 }),
  TTL_HOUR_2: num({ default: 7200 }),
  TTL_HOUR_6: num({ default: 21600 }),
  TTL_HOUR_12: num({ default: 43200 }),
});

for (const [key, value] of Object.entries(env)) {
  if (value && process.env[key] === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`setting ${process.env[key]}, ${key} to ${env[key]}`);
    }

    process.env[`${key}`] = value as string;
  }
}

if (process.env.NODE_ENV !== 'production') {
  console.log({ env });
}

export default env;
