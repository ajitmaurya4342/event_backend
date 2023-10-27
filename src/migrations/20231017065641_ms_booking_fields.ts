import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ms_booking', table => {
    table.text('seat_names').after('currency').defaultTo(null);
    table.text('total_price').after('seat_names').defaultTo(null);
  });
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ms_booking', table => {
    table.dropColumn('seat_names');
    table.dropColumn('total_price');
  });
}
