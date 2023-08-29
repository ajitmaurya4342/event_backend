import type { Redis as IRedis } from 'ioredis';

import Redis from 'ioredis';
import MockRedis from 'ioredis-mock';
import { isEqual } from 'lodash';
import moment from 'moment';

import env from '@/config';
import { createResolvablePromise } from '@/utils/promises';
import { generateUuid, logger, withJitter } from '@/utils/utils';

const redisHost = env.REDIS_HOST || '127.0.0.1';
const redisPort = env.REDIS_PORT || 6379;
const redisPassword = env.REDIS_PASSWORD || null;
const redisDatabase = env.REDIS_DB || '0';
const redisKeyPrefix = env.REDIS_PREFIX || 'reporting:';
const expiryChannel = `__keyevent@${redisDatabase}__:expired`;
const redisOptions = {
  host: redisHost,
  port: Number(redisPort),
  password: redisPassword,
  db: Number(redisDatabase),
  keyPrefix: redisKeyPrefix,
  connectTimeout: 17000,
  // maxRetriesPerRequest: 4,
  // retryStrategy: (times) => Math.min(times * 30, 1000),
  reconnectOnError: error => {
    logger.info('redis reconnectOnError', { error });
    // const targetErrors = [/READONLY/, /ETIMEDOUT/];
    // targetErrors.forEach((targetError) => {
    //   if (targetError.test(error.message)) {
    //     return true;
    //   }
    // });
    return true;
  },
};

export let redisClient: IRedis = null;

export async function connectToRedis(): Promise<IRedis | undefined> {
  if (env.NO_REDIS) return;

  if (redisClient !== null) return redisClient;

  redisClient = new Redis({ ...redisOptions, enableAutoPipelining: false });

  redisClient
    .on('connect', () => {
      // console.info('[redis] connection established');
    })
    .on('ready', () => {
      if (env.NODE_ENV !== 'production') redisClient.flushall();

      console.info('[redis] connection ready');
      // redisClient.config("SET", "notify-keyspace-events", "Ex")
    })
    .on('error', error => {
      console.error('[redis] error', error);
    })
    .on('close', () => {
      console.info('[redis] connection closed');
    })
    .on('reconnecting', () => {
      console.info('[redis] reconnecting...');
    })
    .on('end', () => {
      console.info('[redis] connection end');
    })
    .on('subscribe', (channel, count) => {
      console.info(`[redis] subscribed channel ${channel} count #${count}`);
    })
    .on('unsubscribe', (channel, count) => {
      console.info(`[redis] unsubscribed channel ${channel}, ${count}`);
    });

  function deleteSetMembersCache(setKeys: string[]) {
    return setKeys.map(
      setKey =>
        new Promise(resolve => {
          // get all keys associated with tag
          redisClient.scard(setKey, (errScard, totalMembers) => {
            let deletedMembers = 0;
            if (!totalMembers) {
              resolve(0);
              return;
            }

            const stream = redisClient.sscanStream(setKey, { count: 50 });
            stream.on('data', cacheKeys => {
              stream.pause();

              if (!cacheKeys.length) {
                setTimeout(() => stream.resume());
                return;
              }

              redisClient.del(cacheKeys, errDel => {
                if (errDel) {
                  console.error(`${errDel.message}\n${errDel.stack}`);
                }

                redisClient.srem(setKey, cacheKeys, errSrem => {
                  if (errSrem) {
                    console.error(`${errSrem.message}\n${errSrem.stack}`);
                  }

                  deletedMembers += cacheKeys.length;
                  setTimeout(() => stream.resume());
                });
              });
            });
            stream.on('end', () => {
              setTimeout(() => {
                resolve(totalMembers - deletedMembers);
              }, 5000);
            });
          });
        }),
    );
  }

  /**
   * @param {string} key
   * @param {string} tagsCsv
   * @param {number} cacheTTL - In seconds
   * @param {Object} data
   */
  redisClient.put = (key = '', tagsCsv = '', cacheTTL, data) => {
    if (!key) return;

    const ttlWithJitter = withJitter(cacheTTL);

    const tags = tagsCsv
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    if (tags.length) {
      // cache data with tag
      const multi = redisClient.multi();

      multi.setex(key, ttlWithJitter, JSON.stringify(data));

      tags.forEach(tag => {
        multi.sadd(`tag:${tag}`, key);
      });

      multi.exec(err => {
        if (err) {
          console.error(`${err.message}\n${err.stack}`);
        }
      });
    } else {
      // cache data without tag
      redisClient.setex(key, ttlWithJitter, JSON.stringify(data), err => {
        if (err) {
          console.error(`${err.message}\n${err.stack}`);
        }
      });
    }
  };

  /**
   * @param {string} tagsCsv
   * @param {Function} cb
   */
  redisClient.purge = (tagsCsv = '', cb = () => ({})) => {
    const tags = [
      ...new Set(
        tagsCsv
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
      ),
    ];

    if (tags.length) {
      const multi = redisClient.multi();

      const renamedTagKeys = tags.map(tag => {
        const oldKey = `tag:${tag}`;
        const newKey = `tag:temp:${tag}-${generateUuid()}`;

        multi.rename(oldKey, newKey); // rename tag to a temp key
        multi.expire(newKey, 600); // expire temp set in 10 minutes

        return newKey;
      });

      multi.exec(err => {
        if (err) {
          console.error(`${err.message}\n${err.stack}`);
        }
      });

      Promise.all(deleteSetMembersCache(renamedTagKeys)).finally(() => {
        // call it again to revisit any missing keys in scan
        Promise.all(deleteSetMembersCache(renamedTagKeys)).finally(() => {
          if (cb && typeof cb === 'function') {
            try {
              if (cb.then) {
                cb()
                  .then(x => x)
                  .catch(e => {
                    logger.info('[redis] purge callback error', e);
                  });
              } else {
                cb();
              }
            } catch (e) {
              logger.info('[redis] purge callback error', e);
            }
          }
        });
      });
    }
  };

  return redisClient;
}

/**
 * If function is called multiple times before first result is saved,
 * we'll return previous promise instead of executing getter multiple times
 */
const currentResultPromiseForCacheKey = new Map<string, Promise<string>>();
export async function getCachedData(cacheKey = '', thunderingHerd = false) {
  if (redisClient === null) return;

  if (!cacheKey) return;

  if (!thunderingHerd) return redisClient.get(cacheKey);

  // it was already called and is not yet completed
  const alreadyInProgressPromise = currentResultPromiseForCacheKey.get(cacheKey);

  if (alreadyInProgressPromise) {
    return alreadyInProgressPromise;
  }

  // there is no pending promise
  // create promise to share with other calls before we save to redis
  const inProgressPromise = createResolvablePromise<string>();
  currentResultPromiseForCacheKey.set(cacheKey, inProgressPromise.promise);

  // get our data
  const cachedData = await redisClient.get(cacheKey);

  // when done - remove pending promise before resolving it
  currentResultPromiseForCacheKey.delete(cacheKey);
  inProgressPromise.resolve(cachedData);

  return cachedData;
}

/**
 * @param {string} cacheKey
 * @param {string} cacheTag
 * @param {number} cacheTTL - In seconds
 * @param {Object} data
 */
export function setCachedData(
  cacheKey = '',
  cacheTag = '',
  cacheTTL = 60 * 5,
  data = {},
) {
  if (redisClient === null) return;

  if (!cacheKey) return;

  redisClient.put(cacheKey, cacheTag, cacheTTL, data);
}

/**
 * @param {string} setOfUniqueRequest
 * @param {string} originalUrl
 * @param {string} token
 */
export async function updateSetOfUniqueRequest(
  setOfUniqueRequest = '',
  originalUrl = '',
  token = '',
) {
  if (redisClient === null) return;

  if (!setOfUniqueRequest || !originalUrl) return;

  // TODO: app sending nocache=RAMDOM_STRING to bypass cache, check if it is still needed
  if (String(originalUrl).toLowerCase().includes('nocache')) return;

  const pathWithToken = `${originalUrl}|!${token || ''}`.trim();
  const key = `setOfOriginalUrl:${setOfUniqueRequest}`.trim();
  const ttlSeconds = 3600 * 1.25; // 3600 = 1 hour

  return redisClient
    .sadd(key, pathWithToken)
    .then(isNew => {
      if (isNew == 1) {
        return redisClient
          .expire(key, ttlSeconds)
          .then(() => {
            return !!isNew;
          })
          .catch(() => {
            return false;
          });
      }

      return Promise.resolve(!!isNew);
    })
    .catch(() => {
      return false;
    });
}
