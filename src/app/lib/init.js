//init.js

import { executeQuery } from './sqlite';
import { Queries } from '../constants/queries';

export async function ensureSchema() {
    await executeQuery(Queries.CREATE_TABLE);
}