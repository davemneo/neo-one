import { Context } from 'koa';
// tslint:disable next-line match-default-export-name
import tooBusy from 'toobusy-js';

export interface Options {
  readonly interval?: number;
  readonly maxLag?: number;
  readonly smoothingFactor?: number;
}

tooBusy.maxLag(1200);

export const tooBusyCheck = (options?: Options) => {
  if (options !== undefined && options.interval !== undefined) {
    tooBusy.interval(options.interval);
  }
  if (options !== undefined && options.maxLag !== undefined) {
    tooBusy.maxLag(options.maxLag);
  }
  if (options !== undefined && options.smoothingFactor !== undefined) {
    tooBusy.smoothingFactor(options.smoothingFactor);
  }

  return async (ctx: Context, next: () => Promise<void>) => {
    if (tooBusy()) {
      ctx.status = 500;
    } else {
      await next();
    }
  };
};
