const USE_DB = `USE DATABASE jobs.sqlite;`;
class Queries {
   static FIELDS = [
        "id",
        "company",
        "title",
        "status",
        "appliedAt",
        "jobUrl",
        "notes",
        "updatedAt",
        "resume_used",
        "cover_letter",
        "posting_pdf",
        "posting_html"
    ]
    static getFields = this.FIELDS.join(", ");

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
        (CAST(unixepoch('now') * 1000 AS INTEGER))
            );
    `;

    static GET_COMPANIES = `
        ${USE_DB}
        SELECT DISTINCT(company) FROM jobs 
        ORDER BY company ASC;
    `;
    static GET_JOBS = `
        ${USE_DB}
        SELECT ${this.getFields}
        FROM jobs
        ORDER BY updatedAt DESC LIMIT 50;
    `;

    static GET_JOBS_NOT_REJECTED = `
        ${USE_DB}
        SELECT ${this.getFields}
        FROM jobs
        WHERE status != 'Rejected'
        ORDER BY updatedAt DESC LIMIT 50;
    `

    static GET_JOBS_BY_TIMEFRAME = (time = -7)=> `
    ${USE_DB}
    SELECT title, company, url
    from jobs_formattedDate
    WHERE 
        appliedAt >= unixepoch('now', '${time} days')
    `
    static GET_JOB_BY_ID = `
        ${USE_DB}
        SELECT ${this.getFields}
        FROM jobs
        WHERE id = ?;
    `;

    static INSERT_JOB = `
        ${USE_DB}
        INSERT INTO jobs (id, company, title, status, appliedAt, jobUrl, notes, resume_used, cover_letter, posting_pdf, posting_html)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    static UPDATE_JOB = (fields)=> `
        ${USE_DB}
        UPDATE jobs
        SET ${fields.map((field, index) => `${field} = ?`)
                .join(', \n') }
        ${fields.length > 0 ? ',' : ''}
            updatedAt = ${new Date().getTime()}
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
            (SELECT COUNT(*) FROM jobs WHERE appliedAt >= unixepoch('now', '-7 days')) as appliedThisWeek,
            (SELECT COUNT(*) FROM jobs WHERE status = 'Interview' AND updatedAt >= unixepoch('now', '-7 days')) as interviewsThisWeek;
    `;

    static GET_JOBS_APPLIED_TODAY = `
        select title, company, url, DATE_APPLIED
        from jobs_formattedDate
        where appliedAt >= unixepoch('now', '-1 days');
    `;
}

export {Queries}