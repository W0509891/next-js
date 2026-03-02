//sqlitecloud.js

import { Database } from '@sqlitecloud/drivers';

let dbInstance = null;

export function getDb() {
    if (typeof window !== 'undefined') {
        throw new Error('DB client must not run in the browser');
    }

    const url = process.env.SQLITECLOUD_URL;

    if (!url) throw new Error('Missing SQLITECLOUD_URL in env');

    // Reuse existing connection or create new one
    if (!dbInstance) {
        dbInstance = new Database(url);
    }

    return dbInstance;
}

// Clean up database connection
export function closeDb() {
    if (dbInstance) {
        try {
            dbInstance.close?.();
        } catch (error) {
            console.warn('Error closing database connection:', error);
        } finally {
            dbInstance = null;
        }
    }
}

// Helper function to execute a query with proper error handling
export async function executeQuery(query, ...params) {
    let retries = 2;

    while (retries > 0) {
        try {
            const db = getDb();
            return await db.sql(query, ...params);
        } catch (error) {
            console.error('Database query error:', error);

            // If connection is lost, reset instance to force reconnection
            if (error.message?.includes('Connection unavailable') ||
                error.message?.includes('disconnect') ||
                error.message?.includes('Maximum number of allowed connections')) {
                closeDb();
                retries--;

                if (retries > 0) {
                    console.log('Retrying database connection...');
                    // Small delay before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
            }

            throw error;
        }
    }
}