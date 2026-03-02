import {executeQuery} from "../lib/sqlitecloud";
import {GET_JOBS} from "../constants/queries";
import Link from "next/link";

const jobs = async () => {

    const jobs = await executeQuery(GET_JOBS);
    console.log(jobs);
    return (
        <section>
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                Job Listing
            </h1>
            {
                jobs.length === 0 ? <p>No jobs found</p> :
                    <ul>
                        {jobs.map(job =>
                            <Link href={`/jobs/${job.id}`} className={`text-zinc-600 dark:text-zinc-400`}>
                                <li key={job.id}>{job.company} - {job.title} ({job.status})</li>
                            </Link>
                        )
                        }
                    </ul>
            }
        </section>
    )
}


export default jobs;