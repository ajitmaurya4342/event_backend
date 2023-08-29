declare namespace Express {
  interface Request {
    reqIp?: string;
    user_info?: Record<string, unknown>;
    globalOptions?: Record<string, unknown>;
    globalOptionsPrivate?: Record<string, unknown>;
  }

  interface Response {
    cacheTTL?: number;
    cacheKey?: string;
    cacheTag?: string;
  }
}
