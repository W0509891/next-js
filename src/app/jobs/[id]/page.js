import {executeQuery} from "../../lib/sqlitecloud";
import {GET_JOB_BY_ID, GET_JOBS} from "../../constants/queries";
import {deleteJobAction} from "./actions";
import Link from "next/link";

const JobDetailPage = async ({params}) => {
    const resolvedParams = await params
    const jobId = resolvedParams.id

    const jobData = await executeQuery(GET_JOB_BY_ID, jobId);
    const job = jobData[0];

    if (!job) return <p>Job not found</p>
    return (

        <article>
            <h1>{job.title} at {job.company}</h1>
            <p>Status: {job.status}</p>
            <p>Applied: {job.appliedAt}</p>
            <p><a href={job.jobUrl} target={"_blank"}>Job Url</a></p>
            <pre>{job.notes}</pre>
            <p>Last update: {job.updatedAt}</p>

            <Link href={`/jobs/${jobId}/edit`}>Edit</Link>

            <form action={deleteJobAction} method={"post"}>
                <input type={"hidden"} name={"id"} value={job.id}/>
                <button className={"text-red-500"} type={"submit"}>Delete</button>
            </form>
        </article>
    )
}


export default JobDetailPage;