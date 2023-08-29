import { cinematicDb } from '@/database';

export async function getGlobalOptions() {
  return cinematicDb('global_options').select([
    'go_id',
    'go_key',
    'go_value',
    'key_name',
  ]);
}
