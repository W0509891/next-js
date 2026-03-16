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
export {createJobAction, updateJobAction, deleteJobAction}