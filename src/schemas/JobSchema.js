import * as z from 'zod';

export const JobSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),

    title: z.string()
        .min(3, "Surely the job has a title, right?")
        .max(100, "Title is too long"),

    company: z.string()
        .min(3, "Surely The company has a name and it's not this short, right?")
        .max(100, "Company is too long"),

    status: z.enum(["Applied", "Interview", "Offer", "Rejected"]),

    notes: z.string()
        .max(1000, "Notes are too long")
        .optional(),

    jobUrl: z.url("Surely there's a link to the job?")
        .max(500, "URL is too long")
        .optional(),

    appliedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
    updatedAt: z.string().optional(),
});

export const CreateJobSchema = JobSchema.omit({id: true, updatedAt: true, appliedAt: true});
export const UpdateJobSchema = JobSchema.omit({updatedAt: true, notes: true});
