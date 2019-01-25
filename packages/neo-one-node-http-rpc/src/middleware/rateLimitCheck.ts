import Redis from 'ioredis';
import ratelimit from 'koa-ratelimit';

import { Context } from 'koa';
import { RedisClient } from 'redis';
// tslint:disable next-line match-default-export-name

interface Options {
  readonly db: RedisClient;
}

const rateLimitDefaults: Options = {
  db: new Redis(),
  duration: 60000,
};

export const rateLimitCheck = (options: Options | ratelimit.MiddlewareOptions = {}) => {
  const opts = { ...rateLimitDefaults, ...options };

  return async (ctx: Context, next: () => Promise<void>) => {
    if (ratelimit(opts)) {
      ctx.status = 429;
    } else {
      await next();
    }
  };
};
