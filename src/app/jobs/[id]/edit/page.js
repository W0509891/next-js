import {updateJobAction} from "../actions";
import {executeQuery} from "@/app/lib/sqlitecloud";
import {GET_JOB_BY_ID} from "@/app/constants/queries";
import Link from "next/link";

const EditJobPage = async ({params}) => {
    const resolvedParams = await params
    const jobId = resolvedParams.id

    const jobData = await executeQuery(GET_JOB_BY_ID, jobId);
    const job = jobData[0];

    return (
        <form action={ updateJobAction }>
            <h1>Edit Job</h1>

            <input type="hidden" name={"id"} defaultValue={jobId}/>

            <label >Company <input type="text" name={"company"} defaultValue={job.company} required/></label>
            <label >Job Title: <input type="text" name={"title"} defaultValue={job.title}/></label>
            <label >Status</label>
            <select name="status" defaultValue={job.status}>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
            </select>
            <label >Applied at: <input name={"appliedAt"} type={"date"} defaultValue={job.appliedAt}/></label>
            <label >Job URL <input name={"jobUrl"} type={"text"} defaultValue={job.jobUrl}/></label>
            <label >Notes: </label>
            <textarea name={"notes"} rows={"4"} defaultValue={job.notes}/>

            <button type={"submit"}>Update Job</button>

            <Link href={`/jobs/${jobId}`}>Cancel</Link>
        </form>
    )
}


export default EditJobPage;