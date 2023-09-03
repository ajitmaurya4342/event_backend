import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('global_options').insert([
    {
      go_key: `TIME_ZONE`,
      key_name: `Time zone`,
      go_value: 'Asia/Calcutta',
    },
    {
      go_key: `S3_UPLOAD`,
      key_name: `Test Setup`,
      go_value: 'N',
    },
    {
      go_key: `BASE_URL_BACKEND`,
      key_name: `Test Setup`,
      go_value: 'http://localhost:3900',
    },
    {
      go_key: `BASE_URL_FRONTEND`,
      key_name: `Test Setup`,
      go_value: 'http://localhost:8080',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex('global_options')
    .del()
    .whereIn('go_key', [
      'TIME_ZONE',
      'S3_UPLOAD',
      'BASE_URL_BACKEND',
      'BASE_URL_FRONTEND',
    ]);
}
