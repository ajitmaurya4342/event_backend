import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ms_guest_customers', table => {
    table.increments('guest_id').primary();
    table.string('guest_unique_id');
    table.string('guest_first_name');
    table.string('guest_last_name');
    table.string('guest_email');
    table.string('guest_phone_number');
    table.enu('guest_is_active', ['Y', 'N']).defaultTo('Y');
    table.integer('created_by').nullable();
    table.integer('updated_by').nullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('ms_guest_customers');
}
