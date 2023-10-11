import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ms_seat_layout', table => {
    table.integer('price_data');
  });
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ms_seat_layout', table => {
    table.dropColumn('price_data');
  });
}
