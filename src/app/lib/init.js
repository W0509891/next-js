//init.js

import { executeQuery } from './sqlitecloud';
import { CREATE_TABLE } from '../constants/queries';

export async function ensureSchema() {
    await executeQuery(CREATE_TABLE);
}