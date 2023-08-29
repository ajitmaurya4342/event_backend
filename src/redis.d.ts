import IORedis from 'ioredis';

declare module 'ioredis' {
  interface Redis {
    put(...args): any;
    purge(...args): any;
  }
}
