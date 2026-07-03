'use server'

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {executeQuery} from "./sqlite";
import {Queries} from "./queries";
import {CreateJobSchema, UpdateJobSchema, ValidateFile} from "@/schemas/JobSchema";
import {isAllowedFile, parse_date, sanitizeSegment} from "@/app/lib/helpers";
import { BlobServiceClient } from "@azure/storage-blob";


const createJobAction = async (formData) => {
    console.log("Create job action called with formData:", formData);
    const {company, title, status, jobUrl, notes } = formData
    const appliedAt = parse_date(formData["appliedAt"])

    const usedResume = formData['usedResume'];
    const usedCoverLetter = formData['usedCoverLetter'];
    const jobPostingHTML = formData['jobPostingHtml'];
    const jobPostingPdf = formData['jobPostingPdf'];

    const result = CreateJobSchema.safeParse({company, title, status, appliedAt, jobUrl, notes})
    if (!result.success) {
        console.log("Validation error:", result.error.flatten());
        return {status: false, errors: result.error.flatten()}
    }
    const id = crypto.randomUUID();

    let {usedResumeUrl, usedCoverLetterUrl, jobPostingHTMLUrl, jobPostingPdfUrl} =
        await batchUplaodDOcs({ company, jobId: id, title }, usedResume, usedCoverLetter, jobPostingHTML , jobPostingPdf);

    await executeQuery(Queries.INSERT_JOB, id, company, title, status, appliedAt, jobUrl, notes, usedResumeUrl, usedCoverLetterUrl, jobPostingPdfUrl, jobPostingHTMLUrl);
    return {status: true, data: {id, ...result.data}}
};

const updateJobAction = async (formData) => {
    console.log("Update job action called with formData:", formData);
    const {id, company, title} = formData
    if (!id) {
        console.error("No ID provided for update");
        return;
    }

    const blobMap = {
        usedResumeUrl: "resume_used",
        usedCoverLetterUrl: "cover_letter",
        jobPostingHTMLUrl: "posting_html",
        jobPostingPdfUrl: "posting_pdf"
    }
    const usedResume = formData['usedResume'];
    const usedCoverLetter = formData['usedCoverLetter'];
    const jobPostingHTML = formData['jobPostingHtml'];
    const jobPostingPdf = formData['jobPostingPdf'];

    let urls =
        await batchUplaodDOcs({ company, jobId: id, title }, usedResume, usedCoverLetter, jobPostingHTML , jobPostingPdf);

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

    for (const [key, value] of Object.entries(urls)) {
        if (urls[key]) {
            let nu_key = blobMap[key];
            data[nu_key] = value;
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
        console.log("innit",values)
        await executeQuery(Queries.UPDATE_JOB(fields), ...values, id);
        console.log("Job updated successfully", data)
        // return {status: true, data: {id, ...result.data}}
    }
};

const updateStatusAction = async (id, status) => {
    await executeQuery(Queries.UPDATE_JOB(["status"]), status, id);
}
const deleteJobAction = async (formData) => {
    const {id} = formData;

    if (!id) {
        return { success: false, error: "No ID provided" };
    }
    await executeQuery(Queries.DELETE_JOB, id);
        return { success: true };

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


const uploadToBlobStorage = async ({ company, jobId, title }, file) => {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
    }
    const containerName = 'jobartifacts';

    // Build path: company_name/job_id_position/filename
    const companySeg = sanitizeSegment(company);
    const positionSeg = sanitizeSegment(title);
    const directory = `${companySeg}/${jobId}_${positionSeg}`;
    const fileName = sanitizeSegment(file.name?.split('.')?.slice(0, -1)?.join('.') || 'resume') + (file.name?.includes('.') ? `.${file.name.split('.').pop()}` : '');
    const blobPath = `${directory}/${fileName}`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'container' }).catch(() => {});

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    const arrayBuffer = await file.arrayBuffer();
    const contentType = /\.pdf$/i.test(fileName) ? 'application/pdf' : (/\.html$/i.test(fileName) ? 'text/html' : undefined);
    await blockBlobClient.uploadData(Buffer.from(arrayBuffer), {
        blobHTTPHeaders: contentType ? { blobContentType: contentType } : undefined,
    });
    return blockBlobClient.url;
};

async function batchUplaodDOcs (job, usedResume, usedCoverLetter, jobPostingHTML , jobPostingPdf){
    let urls = {
        usedResumeUrl: null,
        usedCoverLetterUrl: null,
        jobPostingHTMLUrl: null,
        jobPostingPdfUrl: null
    }

    try {
        if (usedResume && typeof usedResume === 'object' && usedResume.size > 0) {
            const ok = isAllowedFile(usedResume);
            if (!ok) {
                return { status: false, errors: { resume: ["Only PDF or HTML files are allowed"] } };
            }
            urls.usedResumeUrl = await uploadToBlobStorage(job, usedResume)
        }

        if(usedCoverLetter && typeof usedCoverLetter === 'object' && usedCoverLetter.size > 0) {
            const ok = isAllowedFile(usedCoverLetter);
            if (!ok) {
                return { status: false, errors: { resume: ["Only PDF or HTML files are allowed"] } };
            }
            urls.usedCoverLetterUrl = await uploadToBlobStorage(job, usedCoverLetter)
        }

        if(jobPostingHTML && typeof jobPostingHTML === 'object' && jobPostingHTML.size > 0) {
            const ok = isAllowedFile(jobPostingHTML);
            if (!ok) {
                return { status: false, errors: { resume: ["Only PDF or HTML files are allowed"] } };
            }
            urls.jobPostingHTMLUrl = await uploadToBlobStorage(job, jobPostingHTML)
        }

        if(jobPostingPdf && typeof jobPostingPdf === 'object' && jobPostingPdf.size > 0) {
            const ok = isAllowedFile(jobPostingPdf);
            if (!ok) {
                return { status: false, errors: { resume: ["Only PDF or HTML files are allowed"] } };
            }
            urls.jobPostingHTMLUrl = await uploadToBlobStorage(job, jobPostingPdf)
        }
        return urls
    } catch (e) {
        console.error('Resume upload failed:', e);
        // Do not block job creation on upload error; proceed
    }
}
export {createJobAction, updateJobAction, deleteJobAction, exportToCSV, importFromCSV, executeQuery,
    updateStatusAction}