create table jobs_dg_tmp
(
    id        Text not null
        primary key,
    company   TEXT not null,
    title     TEXT not null,
    status    TEXT default 'Applied',
    appliedAt TEXT,
    jobUrl    TEXT,
    notes     TEXT,
    updatedAt TEXT default (CAST(unixepoch('now') * 1000 AS INTEGER)),
    check (status IN ('Applied',
                      'Interview',
                      'Offer',
                      'Draft',
                      'No Response',
                      'Rejected'))
);

insert into jobs_dg_tmp(id, company, title, status, appliedAt, jobUrl, notes, updatedAt)
select id,
       company,
       title,
       status,
       appliedAt,
       jobUrl,
       notes,
       updatedAt
from jobs;

drop table jobs;
drop view jobs_formattedDate;


alter table jobs_dg_tmp
    rename to jobs;

CREATE VIEW jobs_formattedDate as
SELECT id, jobs.title as TITLE, jobs.company as COMPANY, jobUrl as URL,
       appliedAt,
       datetime(appliedAt / 1000, 'unixepoch') as DATE_APPLIED
from jobs


