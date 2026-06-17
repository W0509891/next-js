//sqlite.js

import { DatabaseSync } from 'node:sqlite';
import path from 'path';

let dbInstance = null;

export function getDb() {
    if (typeof window !== 'undefined') {
        throw new Error('DB client must not run in the browser');
    }

    // Reuse existing connection or create new one
    if (!dbInstance) {
        const dbPath = path.resolve(process.cwd(), 'jobs.sqlite');
        try {
            dbInstance = new DatabaseSync(dbPath);
            console.log('Connected to the local SQLite database using node:sqlite.');
        } catch (err) {
            console.error('Error opening database:', err.message);
            throw err;
        }
    }

    return dbInstance;
}

// Clean up database connection
export function closeDb() {
    if (dbInstance) {
        try {
            dbInstance.close();
            console.log('Database connection closed.');
        } catch (err) {
            console.warn('Error closing database connection:', err.message);
        }
        dbInstance = null;
    }
}

// Helper function to execute a query with proper error handling
export async function executeQuery(query, ...params) {
    // Remove SQLITECLOUD specific command if present
    const cleanQuery = query.replace(/USE DATABASE jobs\.sqlite;/g, '').trim();

    const db = getDb();

    return new Promise((resolve, reject) => {
        try {
            const trimmedQuery = cleanQuery.toUpperCase();

            if (trimmedQuery.startsWith('SELECT')) {
                const stmt = db.prepare(cleanQuery);
                const rows = stmt.all(...params);
                resolve(rows);
            } else {
                const stmt = db.prepare(cleanQuery);
                const result = stmt.run(...params);
                resolve({ lastID: result.lastInsertRowid, changes: result.changes });
            }
        } catch (err) {
            console.error('Database query error:', err);
            reject(err);
        }
    });
}