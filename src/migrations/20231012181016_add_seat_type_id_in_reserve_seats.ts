import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ms_reservation', table => {
    table.integer('seat_type_id').after("seat_type").defaultTo(null);
  });
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ms_reservation', table => {
    table.dropColumn('seat_type_id');
  });
}
