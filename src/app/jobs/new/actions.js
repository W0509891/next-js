'use server'

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
    await executeQuery(Queries.INSERT_JOB, company, title, status, appliedAt, jobUrl, notes)

    redirect('/jobs')
};


export {createJobAction}