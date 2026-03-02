'use server'

import {executeQuery} from "@/app/lib/sqlitecloud";
import {UPDATE_JOB, DELETE_JOB} from "@/app/constants/queries";
import {redirect} from "next/navigation";

const updateJobAction = async (formData) => {
    const company = formData.get("company")
    const title = formData.get("title")
    const status = formData.get("status")
    const appliedAt = formData.get("appliedAt")
    const jobUrl = formData.get("jobUrl")
    const notes = formData.get("notes")
    const id = formData.get("id")

    //execute database query to insert new job
    await executeQuery(UPDATE_JOB, company, title, status, appliedAt, jobUrl, notes, id)

    redirect(`/jobs/${id}`)
};


const deleteJobAction = async (formData) => {
    const id = formData.get("id")
    await executeQuery(DELETE_JOB, id)
    redirect('/jobs')
}
export {updateJobAction, deleteJobAction}