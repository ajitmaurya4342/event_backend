import type { Knex } from 'knex';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

function onError(err) {
  console.error({ connectionError: err });
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      charset: 'utf8',
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBNAME,
      port: Number(process.env.DBPORT),
      multipleStatements: true,
      connectTimeout: 60000,
      // queryTimeout: 6000,
    },
    pool: {
      min: 0,
      max: 140,
      propagateCreateError: false,

      afterCreate: (conn, done) => {
        conn._id = uuidv4();
        console.info('[knex] created connection ' + conn._id);

        conn.once('error', onError);
        conn.once('end', () => {
          console.info('[knex] connection ended: ' + conn._id);
          conn.removeListener('error', onError);
        });

        done(null, conn);
      },
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/migrations',
      extension: 'ts',
      loadExtensions: ['.js', '.ts', '.mjs', '.cjs'],
    },
  },

  staging: {
    client: 'mysql2',
    connection: {
      charset: 'utf8',
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBNAME,
      port: Number(process.env.DBPORT),
      multipleStatements: true,
      connectTimeout: 60000,
      // queryTimeout: 6000,
    },
    pool: {
      min: 0,
      max: 140,
      propagateCreateError: false,

      afterCreate: (conn, done) => {
        conn._id = uuidv4();
        console.info('[knex] created connection ' + conn._id);

        conn.once('error', onError);
        conn.once('end', () => {
          console.info('[knex] connection ended: ' + conn._id);
          conn.removeListener('error', onError);
        });

        done(null, conn);
      },
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/migrations',
      extension: 'ts',
      loadExtensions: ['.js', '.ts', '.mjs', '.cjs'],
    },
  },

  production: {
    client: 'mysql2',
    connection: {
      charset: 'utf8',
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBNAME,
      port: Number(process.env.DBPORT),
      multipleStatements: true,
      connectTimeout: 60000,
      // queryTimeout: 6000,
    },
    pool: {
      min: 0,
      max: 140,
      propagateCreateError: false,

      afterCreate: (conn, done) => {
        conn._id = uuidv4();
        console.info('[knex] created connection ' + conn._id);

        conn.once('error', onError);
        conn.once('end', () => {
          console.info('[knex] connection ended: ' + conn._id);
          conn.removeListener('error', onError);
        });

        done(null, conn);
      },
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/migrations',
      extension: 'ts',
      loadExtensions: ['.js', '.ts', '.mjs', '.cjs'],
    },
  },
};

module.exports = config;
