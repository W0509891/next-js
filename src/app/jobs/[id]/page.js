import {executeQuery} from "../../lib/sqlitecloud";
import {Queries} from "../../constants/queries";
import {deleteJobAction} from "../actions";
import Link from "next/link";
import {statusColor} from "@/schemas/Style";
import {redirect} from "next/navigation";

const JobDetailPage = async ({params}) => {
    const resolvedParams = await params
    const jobId = resolvedParams.id

    const jobData = await executeQuery(Queries.GET_JOB_BY_ID, jobId);
    const job = jobData[0];

    if (!job) return <p className="text-center text-lg mt-10">Job not found</p>

    return (
        <article className="max-w-2xl mx-auto  p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <Link href={'/jobs'}
                  className={"px-4 py-2 bg-blue-50 hover:bg-transparent hover:text-white text-black rounded-md" +
                      " transition-colors" +
                      " font-medium text-sm"}>
                Back
            </Link>
            <header className="mt-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">{job.company}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor(job.status)}`}>
                        {job.status}
                    </span>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Applied</h2>
                    <p className="text-gray-800 dark:text-gray-200">{new Date(job.appliedAt).toLocaleDateString()}</p>
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Job Link</h2>
                    <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300
                        break-all underline decoration-1 underline-offset-4 transition-colors"
                    >
                        {job.jobUrl}
                    </a>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h2>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-100 dark:border-gray-800">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
                        {job.notes || "No notes provided."}
                    </pre>
                </div>
            </div>

            <footer className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs text-gray-400">
                    Last updated: {new Date(job.updatedAt).toLocaleString()}
                </div>

                <div className="flex flex-row items-center gap-4">
                    <Link
                        href={`/jobs/${jobId}/edit`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm"
                    >
                        Edit Job
                    </Link>

                    <form action={deleteJobAction} method="post">
                        <input type="hidden" name="id" value={job.id}/>
                        <button
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors font-medium text-sm border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                            type="submit"
                        >
                            Delete
                        </button>
                    </form>
                </div>
            </footer>
        </article>
    )
}


export default JobDetailPage;