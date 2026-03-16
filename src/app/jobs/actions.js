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
    if (!result.success) {
        console.log("Validation error:", result.error.flatten());
        return
    }

    //execute database query to insert new job
    fetch("/api/jobs/", {
        method: "PUT",
        body: JSON.stringify({id, company, title, status, appliedAt, jobUrl, notes}),
    }).then(response => response.json())
        .then(data => console.log(data))

    redirect(`/jobs/${id}`)
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
    const headers = Object.keys(json);
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

}

export {createJobAction, updateJobAction, deleteJobAction, exportToCSV, importFromCSV}