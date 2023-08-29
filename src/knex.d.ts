import { Knex } from 'knex';

declare module 'knex/types/tables' {
  interface Tables {
    // This is same as specifying `knex<GlobalOptions>('global_options')`
    global_options: GlobalOptions;
    global_options_private: GlobalOptionsPrivate;
  }
}
