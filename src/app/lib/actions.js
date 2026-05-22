'use server'

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {executeQuery} from "./sqlite";
import {Queries} from "../constants/queries";
import {CreateJobSchema, UpdateJobSchema} from "@/schemas/JobSchema";


const createJobAction = async (formData) => {
    const company = formData.get("company")
    const title = formData.get("title")
    const status = formData.get("status")
    const appliedAt = formData.get("appliedAt")
    const jobUrl = formData.get("jobUrl")
    const notes = formData.get("notes")

    const result = CreateJobSchema.safeParse({company, title, status, appliedAt, jobUrl})
    if (!result.success) {
        console.log("Validation error:", result.error.flatten());
        return
    }
    const id = crypto.randomUUID();
    console.log(formData)
    await executeQuery(Queries.INSERT_JOB, id, company, title, status, appliedAt, jobUrl, notes);

    revalidatePath('/jobs')
    redirect('/jobs')
};

const updateJobAction = async (formData) => {
    const id = formData.get("id")
    if (!id) {
        console.error("No ID provided for update");
        return;
    }

    const data = {};
    const updatableFields = ["company", "title", "status", "appliedAt", "jobUrl", "notes"];
    
    for (const field of updatableFields) {
        if (formData.has(field)) {
            data[field] = formData.get(field);
        }
    }

    const result = UpdateJobSchema.safeParse({id, ...data})
    if (result.success) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        await executeQuery(Queries.UPDATE_JOB(fields), ...values, id);
        revalidatePath(`/jobs/${id}`)
        revalidatePath('/jobs')
        redirect(`/jobs`)
    }
    else {
        console.log("Validation error:", result.error.flatten());
    }

};

const updateStatusAction = async (id, status) => {
    await executeQuery(Queries.UPDATE_JOB(["status"]), status, id);
    revalidatePath(`/jobs`)
    redirect(`/jobs`)
}
const deleteJobAction = async (formData) => {
    let id;
    if (formData instanceof FormData) {
        id = formData.get("id")
    } else {
        id = formData;
    }
    
    await executeQuery(Queries.DELETE_JOB, id);
    
    revalidatePath('/jobs')
    if (!(formData instanceof FormData)) {
        return { success: true };
    }
    redirect('/jobs')
}

const exportToCSV = async (jobs) => {
    if (jobs.length === 0) return;
    const csv = convertJSONToCSV(jobs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "jobs_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        await executeQuery(Queries.INSERT_JOB, job.company, job.title, job.status, job.appliedAt, job.jobUrl, job.notes);
    }
    revalidatePath('/jobs')

    return {
        success: true,
        count: jobs.length,
        errors: errors.length > 0 ? errors : null
    };
}

export {createJobAction, updateJobAction, deleteJobAction, exportToCSV, importFromCSV, executeQuery,
    updateStatusAction}