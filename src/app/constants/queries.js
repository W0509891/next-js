const USE_DB = `USE DATABASE jobs.sqlite;`;
class Queries {


    static CREATE_TABLE = `
        ${USE_DB}
        CREATE TABLE IF NOT EXISTS jobs
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            company
            TEXT
            NOT
            NULL,
            title
            TEXT
            NOT
            NULL,
            status
            TEXT
            CHECK (
            status
            IN
        (
            'Applied',
            'Interview',
            'Offer',
            'Rejected'
        )) DEFAULT 'Applied',
            appliedAt TEXT,
            jobUrl TEXT,
            notes TEXT,
            updatedAt TEXT DEFAULT
        (
            datetime
        (
            'now'
        ))
            );
    `;

    static GET_JOBS = `
        ${USE_DB}
        SELECT id,
               company,
               title,
               status,
               appliedAt,
               jobUrl,
               notes,
               updatedAt
        FROM jobs
        ORDER BY updatedAt DESC LIMIT 50;
    `;

    static GET_JOB_BY_ID = `
        ${USE_DB}
        SELECT id,
               company,
               title,
               status,
               appliedAt,
               jobUrl,
               notes,
               updatedAt
        FROM jobs
        WHERE id = ?;
    `;

    static INSERT_JOB = `
        ${USE_DB}
        INSERT INTO jobs (company, title, status, appliedAt, jobUrl, notes)
  VALUES (?, ?, ?, ?, ?, ?);
    `;

    static UPDATE_JOB = `
        ${USE_DB}
        UPDATE jobs
        SET company   = ?,
            title     = ?,
            status    = ?,
            appliedAt = ?,
            jobUrl    = ?,
            notes     = ?,
            updatedAt = datetime('now')
        WHERE id = ?;
    `;

    static DELETE_JOB = `
        ${USE_DB}
        DELETE
        FROM jobs
        WHERE id = ?;
    `;

    static GET_METRICS = `
        ${USE_DB}
        SELECT 
            (SELECT COUNT(*) FROM jobs) as totalJobs,
            (SELECT COUNT(*) FROM jobs WHERE status = 'Applied') as appliedCount,
            (SELECT COUNT(*) FROM jobs WHERE status = 'Interview') as interviewCount,
            (SELECT COUNT(*) FROM jobs WHERE status = 'Offer') as offerCount,
            (SELECT COUNT(*) FROM jobs WHERE status = 'Rejected') as rejectedCount,
            (SELECT COUNT(*) FROM jobs WHERE appliedAt >= date('now', '-7 days')) as appliedThisWeek,
            (SELECT COUNT(*) FROM jobs WHERE status = 'Interview' AND updatedAt >= date('now', '-7 days')) as interviewsThisWeek;
    `;
}

export {Queries}