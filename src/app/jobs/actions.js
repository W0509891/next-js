'use client'

import {redirect} from "next/navigation";
import {CreateJobSchema, UpdateJobSchema} from "@/schemas/JobSchema";

const createJobAction = async (formData) => {
    const company = formData.get("company")
    const title = formData.get("title")
    const status = formData.get("status")
    const appliedAt = formData.get("appliedAt")
    const jobUrl = formData.get("jobUrl")
    const notes = formData.get("notes")

    const result = CreateJobSchema.safeParse({company, title, status, appliedAt, jobUrl, notes})
    if (!result.success) {
        console.log("Validation error:", result.error.flatten());
        return
    }

    //execute database query to insert new job
    await fetch('/api/jobs/', {
        method: 'POST',
        body: JSON.stringify({company, title, status, appliedAt, jobUrl, notes}),
    }).then(response => response.json()
        .then(data => console.log(data))
    )

    redirect('/jobs')
};

const updateJobAction = async (formData) => {
    const company = formData.get("company")
    const title = formData.get("title")
    const status = formData.get("status")
    const appliedAt = formData.get("appliedAt")
    const jobUrl = formData.get("jobUrl")
    const notes = formData.get("notes")
    const id = formData.get("id")

    const result = UpdateJobSchema.safeParse({id, company, title, status, appliedAt, jobUrl, notes})
    if (result.success) {
        //execute database query to insert new job
        fetch(`/api/jobs?id=${id}`, {
            method: "PUT",
            body: JSON.stringify({company, title, status, appliedAt, jobUrl, notes}),
        }).then(response => response.json())
            .then(data => console.log(data))
        redirect(`/jobs/${id}`)
     }
    else {
        console.log("Validation error:", result.error.flatten());
    }

};


const deleteJobAction = async (formData) => {
    const id = formData.get("id")
    fetch("/api/jobs/", {
        method: "DELETE",
        body: JSON.stringify({id}),
    }).then(response => response.json())
        .then(data => console.log(data))
    redirect('/jobs')
}

const exportToCSV = (jobs) => {
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


const convertJSONToCSV = (json) => {
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
    const results = await Promise.all(jobs.map(job =>
        fetch('/api/jobs/', {
            method: 'POST',
            body: JSON.stringify(job),
        }).then(res => res.json())
    ));

    return {
        success: true,
        count: jobs.length,
        errors: errors.length > 0 ? errors : null
    };
}

export {createJobAction, updateJobAction, deleteJobAction, exportToCSV, importFromCSV}