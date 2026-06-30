//sqlite.js

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { readdir, readFile } from "node:fs/promises";
import fs from "node:fs"

let dbInstance = null;
const dbDir = process.env.DB_DIR || process.cwd();
export const dbPath = path.resolve(dbDir, 'jobs.sqlite');
const migrationsPath = process.env.MIGRATIONS_PATH || "migrations";
const BACKUPPATH = process.env.BACKUP_PATH || "backups";

export function getDb() {
    if (typeof window !== 'undefined') {
        throw new Error('DB client must not run in the browser');
    }

    // Reuse existing connection or create new one
    if (!dbInstance) {
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
            // 1. Force a checkpoint to merge WAL data into the main database file
            // TRUNCATE will merge the changes and then shrink the .wal file to 0 bytes
            dbInstance.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run();
            console.log('WAL checkpoint completed (merged .wal and .shm).');

            dbInstance.close();
            console.log('Database connection closed.');
        } catch (err) {
            console.warn('Error during database shutdown:', err.message);
        }
        dbInstance = null;
    }
}

// 2. Listen for process termination signals to ensure cleanup happens
if (typeof process !== 'undefined') {
    ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
        process.on(signal, () => {
            console.log(`Received ${signal}, closing database...`);
            closeDb();
            process.exit(0);
        });
    });
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

export async function runMigration() {
    console.log("Starting migration process...");

    // 1. Back up the database
    try {
        console.log("Backing up database...");
        await backupDB();
        console.log("Backup created in 'backups/' folder.");
    } catch (error) {
        console.error("Backup failed. Aborting migration for safety.", error);
        return;
    }

    const db = new DatabaseSync(dbPath);

    // Ensure _migrations table exists
    db.exec(`CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`);

    // Get applied migrations
    const appliedMigrations = db.prepare("SELECT name FROM _migrations").all().map(m => m.name);

    // Get all migration files
    const absoluteMigrationsPath = path.resolve(process.cwd(), migrationsPath);
    if (!fs.existsSync(absoluteMigrationsPath)){
        fs.mkdirSync(absoluteMigrationsPath, { recursive: true });
    }

    const migrationFiles = await getMigrationFiles(absoluteMigrationsPath);

    console.log("Applying migrations...");
    for (const file of migrationFiles) {
        if (appliedMigrations.includes(file)) {
            console.log(`Skipping already applied migration: ${file}`);
            continue;
        }

        try {
            const sql = await readFile(path.join(absoluteMigrationsPath, `${file}.sql`), "utf8");
            console.log(`Executing: ${file}`);
            db.exec(sql);
            // Record migration
            db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
        } catch (error) {
            console.error(`Error executing migration ${file}: ${error.message}`);
            process.exit(1)
            break;
            // Depending on your preference, you might want to 'break' here to stop later migrations
        }
    }

    console.log("Migration finished!");
}

async function getMigrationFiles(path) {
    const files = await readdir(path, { withFileTypes: true });
    return files
        .filter(dirent => dirent.isFile() && dirent.name.endsWith(".sql"))
        .map(dirent => dirent.name.replace(/\.sql$/, ""))
        .sort(); // Ensure they run in order
}


async function  backupDB() {
    const date = new Date();
    const dateFormat = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    // console.log(BACKUPPATH);
    if (!fs.existsSync(dbPath)) {
        console.log("No database file found to backup. Skipping backup.");
        return;
    }
    if (!fs.existsSync(BACKUPPATH)) {
        fs.mkdirSync(BACKUPPATH, {recursive: true})
    }
    const backupPath = `${BACKUPPATH}/jobs.sqlite.backup.${dateFormat}.db`;
    fs.copyFileSync(dbPath, backupPath);
}