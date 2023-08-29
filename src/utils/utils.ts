import type { Request } from 'express';
import type { ReadonlyDeep } from 'type-fest';

import { Server } from 'http';
import { promisify } from 'util';

import { createTerminus as gracefulShutdown } from '@godaddy/terminus';
import { isEqual } from 'lodash';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: true,
    },
  },
});

/**
 * Loops through the given checks and returns the first truthy value.
 * @private
 * @param  {Array}  checks  The list of ip checks.
 * @return {String}
 */
function getFirstIp(checks) {
  for (const i in checks) {
    if (checks[i]) {
      return checks[i];
    }
  }

  return null;
}

/**
 * Checks if the given IP conforms to IPv4.
 * @private
 * @param  {String}  ip The IP address.
 * @return {Boolean}
 */
function isIPv4(ip) {
  const regex = /^(\d{1,3}\.){3,3}\d{1,3}(\:\d+)?$/;

  return regex.test(ip);
}

/**
 * Checks if the given IP conforms to IPv6.
 * @private
 * @param  {String}  ip The IP address.
 * @return {Boolean}
 */
function isIPv6(ip) {
  const regex =
    /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;

  return regex.test(ip);
}

export function getIp(req: ReadonlyDeep<Request>) {
  let checks = [
    req.connection ? req.connection.remoteAddress : null,
    req.socket ? req.socket.remoteAddress : null,
    req.connection && req.connection['socket']
      ? req.connection['socket']['remoteAddress']
      : null,
    req['info'] ? req['info']['remoteAddress'] : null,
  ];

  const forwardChecks = [
    req.headers['x-client-ip'],
    req.headers['x-forwarded-for'],

    // nginx
    req.headers['x-real-ip'],

    // Cloudflare
    // https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
    req.headers['cf-connecting-ip'],

    // Rackspace (old, uses x-forwarded-for now), Riverbed
    // https://serverfault.com/questions/409155/x-real-ip-header-empty-with-nginx-behind-a-load-balancer#answer-409159
    req.headers['x-cluster-client-ip'],

    // fastly (old, seem to use x-forwarded-for now)
    req.headers['fastly-ssl'],
    req.headers['fastly-client-ip'],

    // AKAMAI
    // https://community.akamai.com/thread/4612-can-i-get-client-ip-from-this-header-httpcontextcurrentrequestheaderstrue-client-ip
    req.headers['true-client-ip'],

    // Zscaler
    req.headers['z-forwarded-for'],

    // alt x-forwarded-for
    req.headers['x-forwarded'],
    req.headers['forwarded-for'],
    req.headers.forwarded,
  ];

  // Need regular checks after forward checks
  checks = forwardChecks.concat(checks);

  const remoteIPs = getFirstIp(checks);

  if (!remoteIPs) {
    return null;
  }

  let ip = remoteIPs.split(',')[0];

  // Remove ::ffff if there
  if (isIPv6(ip) && ip.indexOf('::ffff') !== -1) {
    ip = ip.replace('::ffff:', '');
  }

  // Apparently Azure Gateway (thanks MS) tacks on port number to the forwarded IP [address:port]
  // https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-faq
  // Q: Does Application Gateway support x-forwarded-for headers?
  if (isIPv4(ip) && ip.indexOf(':') !== -1) {
    ip = ip.split(':')[0];
  }

  return ip.trim();
}

export function generateUuid() {
  return uuidv4();
}

export function safeSerialize(input) {
  const serialized = JSON.stringify(input);
  const parsed = JSON.parse(serialized);

  const isEqualObj = isEqual(parsed, input);

  if (!isEqualObj) throw new Error('Cannot safely serialize input');

  return serialized;
}

/**
 * Jitter adds some amount of randomness to the backoff to spread the retries
 * around in time, if failed calls back off to the same time, they cause
 * contention or overload again
 */
export function withJitter(ttl, percent = 0.06) {
  if (Number.isInteger(ttl) && ttl < 100) return ttl;

  const jitter = ttl * percent;
  const min = ttl - jitter;
  const max = ttl + jitter;

  return Math.floor(Math.random() * (max - min) + min);
}

export function setupGracefulShutdown(server: Server) {
  const closeServer = promisify(server.close.bind(server));

  gracefulShutdown(server, {
    signals: ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGKILL'],

    onSignal: () => {
      // your clean logic, like closing database connections

      console.log('[server] is starting cleanup');

      // return closeServer();
      return Promise.all([]);
    },

    beforeShutdown: async () => {
      console.log('[server] before shutting down');

      // close subscriptions etc here
      return new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
    },

    onShutdown: () => {
      console.log('[server] cleanup finished, server is shutting down');
      return Promise.resolve();
    },

    logger: console.log,
    healthChecks: {
      verbatim: true,
      '/healthz': async function () {
        return {
          version: process.env.NODE_ENV,
        };
      },
    },
  });
}
