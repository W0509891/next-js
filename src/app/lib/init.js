//init.js

import { executeQuery, runMigration } from './sqlite';
import { Queries } from '../lib/queries';

export async function ensureSchema() {
    await executeQuery(Queries.CREATE_TABLE);
    await runMigration();
}