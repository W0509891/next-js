'use server'

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {executeQuery} from "./sqlite";
import {Queries} from "./queries";
import {CreateJobSchema, UpdateJobSchema} from "@/schemas/JobSchema";
import {parse_date} from "@/app/lib/helpers";


const createJobAction = async (formData) => {
    const company = formData["company"]
    const title = formData["title"]
    const status = formData["status"]
    const appliedAt = parse_date(formData["appliedAt"])
    const jobUrl = formData["jobUrl"]
    const notes = formData["notes"]

    const result = CreateJobSchema.safeParse({company, title, status, appliedAt, jobUrl})
    if (!result.success) {
        console.log("Validation error:", result.error.flatten());
        return {status: false, errors: result.error.flatten()}
    }
    const id = crypto.randomUUID();
    await executeQuery(Queries.INSERT_JOB, id, company, title, status, appliedAt, jobUrl, notes);
    return {status: true, data: {id, ...result.data}}
};

const updateJobAction = async (formData) => {
    console.log("Update job action called with formData:", formData);
    const id = formData["id"]
    if (!id) {
        console.error("No ID provided for update");
        return;
    }

    const data = {};
    const updatableFields = ["company", "title", "status", "appliedAt", "jobUrl", "notes"];

    for (const field of updatableFields) {
        if (formData[field] !== undefined && formData[field] !== null && formData[field] !== "") {
            if (field === "appliedAt") {
                data[field] = parse_date(formData[field]);
            }
            else {
            data[field] = formData[field];
            }
        }
    }

    const result = UpdateJobSchema.safeParse({id, ...data})
    if (!result.success) {
        console.log("Validation error:", result.error.flatten());
        return {status: false, errors: result.error.flatten()}
    }
    else {
        const fields = Object.keys(data);
        const values = Object.values(data);
        await executeQuery(Queries.UPDATE_JOB(fields), ...values, id);
        console.log("Job updated successfully", {id, ...result.data})
        return {status: true, data: {id, ...result.data}}
    }

};

const updateStatusAction = async (id, status) => {
    await executeQuery(Queries.UPDATE_JOB(["status"]), status, id);
}
const deleteJobAction = async (formData) => {
    let id;
    if (formData instanceof FormData) {
        id = formData["id"]
    } else {
        id = formData;
    }

    await executeQuery(Queries.DELETE_JOB, id);

    if (!(formData instanceof FormData)) {
        return { success: true };
    }
}

const exportToCSV = async (q, timeframe) => {
    const query = {
        daily: Queries.GET_JOBS_APPLIED_TODAY,
        timeframe: Queries.GET_JOBS_BY_TIMEFRAME(timeframe || -7),
        all: Queries.GET_JOBS,
    }
    const jobs = await executeQuery(query[q]);
    if (jobs.length === 0) return;

    const csv = await convertJSONToCSV(jobs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    return blob;

}

const convertJSONToCSV = async (json) => {
    if (json.length === 0) return "";
    console.log(json)
    const headers = Object.keys(json[0]);
    const headerRow = headers.join(',');
    const rows = json.map(obj =>
        headers.map(header => {
            const val = obj[header] || "";
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(',')
    ).join('\n');
    return `${headerRow}\n${rows}`;
};

const importFromCSV = async (csvText) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return { success: false, message: "CSV is empty or missing headers" };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const jobs = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const job = {};
        headers.forEach((header, index) => {
            if (index < values.length) {
                job[header] = values[index];
            }
        });

        const result = CreateJobSchema.safeParse(job);
        if (result.success) {
            jobs.push(result.data);
        } else {
            const path = result.error.issues.map(issue => issue.path.join('.')).join(', ');
            const message = result.error.issues.map(issue => issue.message).join(', ');
            errors.push(`Row ${i + 1}: Errors with these fields - ${JSON.stringify(path)}`);
        }
    }

    if (errors.length > 0 && jobs.length === 0) {
        return { success: false, errors };
    }

    // Insert valid jobs
    for (const job of jobs) {
        const id = job.id || crypto.randomUUID();
        await executeQuery(Queries.INSERT_JOB, id, job.company, job.title, job.status, job.appliedAt, job.jobUrl, job.notes);
    }
    revalidatePath('/jobs')

    return {
        success: true,
        count: jobs.length,
        errors: errors.length > 0 ? errors : null
    };
}

const uploadToBlobStorage = async (dir_name, file) => {
    const blob = await file.arrayBuffer();
    const blobUrl = URL.createObjectURL(new Blob([blob]));
    return blobUrl;
};

export {createJobAction, updateJobAction, deleteJobAction, exportToCSV, importFromCSV, executeQuery,
    updateStatusAction}