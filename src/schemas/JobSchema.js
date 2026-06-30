import * as z from 'zod';
import {STATUSES} from "../app/lib/constants.ts";

const ACCEPTED_FILE_TYPES = ["application/pdf", "text/html"];
export const JobSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),

    title: z.string()
        .min(3, "Surely the job has a title, right?")
        .max(100, "Title is too long"),

    company: z.string()
        .min(1, "Surely The company has a name and it's not this short, right?")
        .max(100, "Company is too long"),

    status: z.enum(STATUSES),

    notes: z.string()
        .max(1000, "Notes are too long")
        .optional(),

    jobUrl: z.url("Surely there's a link to the job?")
        .max(1000, "URL is too long")
        .optional(),

    usedResume: z.instanceof(File).optional().refine(file => ACCEPTED_FILE_TYPES.includes(file?.type)),
    jobPostingPdf: z.instanceof(File).optional().refine(file => ACCEPTED_FILE_TYPES[0].includes(file?.type)),
    jobPostingHtml: z.instanceof(File).optional().refine(file => ACCEPTED_FILE_TYPES[1].includes(file?.type)),
    usedCoverLetter: z.instanceof(File).optional().refine(file => ACCEPTED_FILE_TYPES.includes(file?.type)),

    appliedAt: z.union([z.string(), z.number()]).optional(),
    updatedAt: z.union([z.string(), z.number()]).optional(),
});

export const CreateJobSchema = JobSchema.omit({id: true, updatedAt: true}).partial();
export const UpdateJobSchema = JobSchema.omit({updatedAt: true, notes: true}).partial();

export const ValidateFile =JobSchema.pick({usedResume: true, usedCoverLetter: true, jobPostingHtml: true, jobPostingPdf: true}).partial();

export const metrics = {
    totalJobs: 0,
    appliedCount: 0,
    interviewCount: 0,
    offerCount: 0,
    rejectedCount: 0,
    appliedThisWeek: 0,
    interviewsThisWeek: 0
}
