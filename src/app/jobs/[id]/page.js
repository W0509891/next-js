import {executeQuery} from "../../lib/sqlite";
import {Queries} from "../../lib/queries";
import {deleteJobAction} from "../../lib/actions";
import Link from "next/link";
import {statusColor} from "@/schemas/Style";

const JobDetailPage = async ({params}) => {
    const resolvedParams = await params
    const jobId = resolvedParams.id

    const jobData = await executeQuery(Queries.GET_JOB_BY_ID, jobId);
    const job = jobData[0];

    if (!job) return <p className="text-center text-lg mt-10">Job not found</p>

    return (
        <article className="mx-auto w-full max-w-2xl rounded-lg border border-gray-200 p-4 shadow-md dark:border-gray-800 sm:p-8">
            <Link href={'/jobs'}
                  className={"px-4 py-2 bg-blue-50 hover:bg-transparent hover:text-white text-black rounded-md" +
                      " transition-colors" +
                      " font-medium text-sm"}>
                Back
            </Link>
            <header className="mb-6 mt-4">
                <h1 className="mb-2 break-words text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{job.title}</h1>
                <p className="break-words text-lg font-medium text-gray-600 dark:text-gray-400 sm:text-xl">{job.company}</p>
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

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                    <Link
                        href={`/jobs/${jobId}/edit`}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
                    >
                        Edit Job
                    </Link>

                    <form action={deleteJobAction} method="post">
                        <input type="hidden" name="id" value={job.id}/>
                        <button
                            className="w-full rounded-md border border-transparent px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900/30 dark:hover:bg-red-900/10 sm:w-auto"
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