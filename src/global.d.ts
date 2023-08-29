/* eslint-disable no-use-before-define */
import type { Redis } from 'ioredis';
import type { Knex } from 'knex';
import type { ReadonlyDeep } from 'type-fest';

import express, { Express } from 'express';

declare global {
  /**
   * Now declare things that go in the global namespace,
   * or augment existing declarations in the global namespace.
   */

  interface GlobalOptions {
    go_id: number;
    key_name: string;
    go_key: string;
    go_value: string;
  }

  interface GlobalOptionsPrivate {
    go_id: number;
    key_name: string;
    go_key: string;
    go_value: string;
  }

  type AppRouterOptions = ReadonlyDeep<{
    db?: Knex;
    mainDb?: Knex;
    app?: Express;
    redis?: Redis;
  }>;
}
