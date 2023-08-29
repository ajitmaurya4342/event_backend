import { Knex } from "knex";


export async function up(knex: Knex) {
    await knex.schema.createTable("global_options", (table) => {
        table.increments("go_id").primary();
        table.text("go_key");
        table.text("go_value");
        table.text("key_name");
    });

     await knex.schema.createTable("global_option_private", (table) => {
        table.increments("go_id").primary();
        table.text("go_key");
        table.text("go_value");
        table.text("key_name");
    });

     await knex.schema.createTable("organizations", (table) => {
        table.increments("org_id").primary();
        table.string("org_name");
        table.text("org_address");
        table.text("org_other");
        table.enu("org_is_active", ["Y", "N"]).defaultTo("Y");
        table.integer("created_by").nullable();
        table.integer("updated_by").nullable();
        table.datetime("created_at").defaultTo(knex.fn.now());
        table.datetime("updated_at").defaultTo(knex.fn.now());
    });

    await knex.schema.createTable("ms_countries", (table) => {
        table.increments("country_id").primary();
        table.string("country_name");
        table.string("country_code");
        table.integer("org_id");
        table.enu("country_is_active", ["Y", "N"]).defaultTo("Y");
        table.integer("created_by").nullable();
        table.integer("updated_by").nullable();
        table.datetime("created_at").defaultTo(knex.fn.now());
        table.datetime("updated_at").defaultTo(knex.fn.now());
    });

    
    await knex.schema.createTable("ms_cities", (table) => {
        table.increments("city_id").primary();
        table.string("city_name");
        table.integer("country_id");
        table.enu("city_is_active", ["Y", "N"]).defaultTo("Y");
        table.integer("created_by").nullable();
        table.integer("updated_by").nullable();
        table.datetime("created_at").defaultTo(knex.fn.now());
        table.datetime("updated_at").defaultTo(knex.fn.now());
    });

     await knex.schema.createTable("ms_genre", (table) => {
        table.increments("genre_id").primary();
        table.string("genre_name");
        table.enu("genre_is_active", ["Y", "N"]).defaultTo("Y");
        table.integer("created_by").nullable();
        table.integer("updated_by").nullable();
        table.datetime("created_at").defaultTo(knex.fn.now());
        table.datetime("updated_at").defaultTo(knex.fn.now());
    });

     await knex.schema.createTable("ms_roles", (table) => {
        table.increments("role_id").primary();
        table.string("role_name");
        table.enu("role_is_active", ["Y", "N"]).defaultTo("Y");
        table.integer("created_by").nullable();
        table.integer("updated_by").nullable();
        table.datetime("created_at").defaultTo(knex.fn.now());
        table.datetime("updated_at").defaultTo(knex.fn.now());
    });

    await knex.schema.createTable("users", (table) => {
        table.increments("user_id").primary();
        table.string("first_name");
        table.string("last_name");
        table.string("employee_code");
        table.string("email");
        table.string("mobile_number");
        table.string("user_name");
        table.text("password");
        table.integer("role_id");
        table.enu("user_is_active", ["Y", "N"]).defaultTo("Y");
        table.integer("created_by").nullable();
        table.integer("updated_by").nullable();
        table.datetime("created_at").defaultTo(knex.fn.now());
        table.datetime("updated_at").defaultTo(knex.fn.now());
    });

     await knex.schema.createTable("user_link_cinema", (table) => {
        table.increments("ulc_id").primary();
        table.integer("user_id")
        table.integer("cinema_id")
    });

     await knex.schema.createTable("user_token", (table) => {
        table.increments("ut_id").primary();
        table.integer("multi_token_id")
        table.integer("user_id")
        table.integer("role_id")
       table.enu("user_token_is_active", ["Y", "N"]).defaultTo("Y");
    });

    await knex("organizations").insert([
        {
            org_id:1,
            org_name:"Event Name",
            org_other:null,
            org_is_active:"Y",
            org_address:null
        }
    ])

    await knex("ms_roles").insert([
        {
            role_id:1,
            role_name:"Super Admin",
            role_is_active:"Y",
         },
         {
            role_id:2,
            role_name:"Event Manager",
            role_is_active:"Y",
         },
    ])
}

export async function down(knex: Knex) {
    await knex.schema.dropTable("global_options");
    await knex.schema.dropTable("global_option_private");
    await knex.schema.dropTable("organizations");
    await knex.schema.dropTable("ms_countries");
    await knex.schema.dropTable("ms_cities");
    await knex.schema.dropTable("ms_genre");
    await knex.schema.dropTable("ms_roles");
    await knex.schema.dropTable("users");
    await knex.schema.dropTable("user_link_cinema");
    await knex.schema.dropTable("user_token");
}
