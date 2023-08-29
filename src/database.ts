import type { Knex as IKnex } from 'knex';

import Knex from 'knex';

import env from '@/config';
import { generateUuid, logger } from '@/utils/utils';

export let knex: IKnex = null;
export let cinematicDb: IKnex = null;

function onError(err) {
  logger.error({ connectionError: err });
}

export async function connectToDatabase() {
  if (knex !== null) return knex;

  knex = Knex({
    client: 'mysql2',
    connection: {
      charset: 'utf8',
      host: env.DBHOST,
      user: env.DBUSER,
      password: env.DBPASSWORD,
      database: env.DBNAME,
      port: env.DBPORT,
      multipleStatements: true,
      connectTimeout: 60000,
      // queryTimeout: 6000,
    },
    pool: {
      min: 0,
      max: 140,

      afterCreate: (conn, done) => {
        conn._id = generateUuid();
        logger.info('[knex] created connection ' + conn._id);

        conn.once('error', onError);
        conn.once('end', () => {
          logger.info('[knex] connection ended: ' + conn._id);
          conn.removeListener('error', onError);
        });

        done(null, conn);
      },
    },
  }).on('query-error', (error, context) => {
    logger.info('query-error', {
      error: error.code,
      sql: error.sql
        ? error.sql.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/gm, ' ')
        : String(error)
            .replace(/(\r\n|\n|\r)/gm, ' ')
            .replace(/\s+/gm, ' '),
    });
  });

  knex.raw('select 1 + 1 as sum').then(([sum]) => {
    // logger.info('[knex] ', { sum });
  });

  return knex;
}

export async function connectToCinematicDatabase() {
  if (cinematicDb !== null) return cinematicDb;

  cinematicDb = Knex({
    client: 'mysql2',
    connection: {
      charset: 'utf8',
      host: env.CINEMATIC_DBHOST,
      user: env.CINEMATIC_DBUSER,
      password: env.CINEMATIC_DBPASSWORD,
      database: env.CINEMATIC_DBNAME,
      port: env.CINEMATIC_DBPORT,
      multipleStatements: true,
      connectTimeout: 60000,
      // queryTimeout: 6000,
    },
    pool: {
      min: 0,
      max: 140,

      afterCreate: (conn, done) => {
        conn._id = generateUuid();
        logger.info('[cinematicDb] created connection ' + conn._id);

        conn.once('error', onError);
        conn.once('end', () => {
          logger.info('[cinematicDb] connection ended: ' + conn._id);
          conn.removeListener('error', onError);
        });

        done(null, conn);
      },
    },
  }).on('query-error', (error, context) => {
    logger.info('cinematic-db-query-error', {
      error: error.code,
      sql: error.sql
        ? error.sql.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/gm, ' ')
        : String(error)
            .replace(/(\r\n|\n|\r)/gm, ' ')
            .replace(/\s+/gm, ' '),
    });
  });

  cinematicDb.raw('select 1 + 2 as sum').then(([sum]) => {
    // logger.info('[cinematicDb] ', { sum });
  });

  return cinematicDb;
}
