export const USE_DB = `USE DATABASE jobs.sqlite;`;

export const CREATE_TABLE = `
  ${USE_DB}
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    title   TEXT NOT NULL,
    status  TEXT CHECK(status IN ('Applied','Interview','Offer','Rejected')) DEFAULT 'Applied',
    appliedAt TEXT,
    jobUrl  TEXT,
    notes   TEXT,
    updatedAt TEXT DEFAULT (datetime('now'))
  );
`;

export const GET_JOBS = `
  ${USE_DB}
  SELECT id, company, title, status, appliedAt, jobUrl, notes, updatedAt
  FROM jobs
  ORDER BY updatedAt DESC
  LIMIT 50;
`;

export const GET_JOB_BY_ID = `
  ${USE_DB}
  SELECT id, company, title, status, appliedAt, jobUrl, notes, updatedAt
  FROM jobs
  WHERE id = ?;
`;

export const INSERT_JOB = `
  ${USE_DB}
  INSERT INTO jobs (company, title, status, appliedAt, jobUrl, notes)
  VALUES (?, ?, ?, ?, ?, ?);
`;

export const UPDATE_JOB = `
  ${USE_DB}
  UPDATE jobs
  SET company = ?, title = ?, status = ?, appliedAt = ?, jobUrl = ?, notes = ?, updatedAt = datetime('now')
  WHERE id = ?;
`;

export const DELETE_JOB = `
  ${USE_DB}
  DELETE FROM jobs WHERE id = ?;
`;