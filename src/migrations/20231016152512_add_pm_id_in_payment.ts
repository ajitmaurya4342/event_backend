import { Knex } from 'knex';

var bcrypt = require('bcryptjs');

export async function up(knex: Knex) {
  await knex.schema.alterTable('ms_payment_booking_detail', table => {
    table.integer('pm_id').defaultTo(0);
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('ms_payment_booking_detail', table => {
    table.dropColumn('pm_id');
  });
}
