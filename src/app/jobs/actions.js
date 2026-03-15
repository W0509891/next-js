'use client'

import {executeQuery} from "@/app/lib/sqlitecloud";
import {Queries} from "@/app/constants/queries";
import {redirect} from "next/navigation";

const createJobAction = async (formData) => {
    const company = formData.get("company")
    const title = formData.get("title")
    const status = formData.get("status")
    const appliedAt = formData.get("appliedAt")
    const jobUrl = formData.get("jobUrl")
    const notes = formData.get("notes")

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

    //execute database query to insert new job
    fetch("/api/jobs/", {
        method: "PATCH",
        body: JSON.stringify({id, company, title, status, appliedAt, jobUrl, notes}),
    }).then(response => response.json())
        .then(data => console.log(data))

    redirect(`/jobs/${id}`)
};


const deleteJobAction = async (formData) => {
    const id = formData.get("id")
    await executeQuery(Queries.DELETE_JOB, id)
    redirect('/jobs')
}
export {createJobAction, updateJobAction, deleteJobAction}