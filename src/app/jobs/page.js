'use client'

import Link from "next/link";
import {useState, useEffect} from "react";
import {exportToCSV, exportToPDF, importFromCSV} from "./actions";
import {statusColor} from "@/schemas/Style";

const JobsPage = () => {

    const [jobs, setJobs] = useState([])
    const [importStatus, setImportStatus] = useState(null);

    // Filter, Sort, Search, Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortConfig, setSortConfig] = useState({ key: "updatedAt", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);


    useEffect(() => {
        loadJobs();
    }, [])

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const result = await importFromCSV(text);
            setImportStatus(result);
            if (result.success) {
                loadJobs();
            }
        };
        reader.readAsText(file);
    };

    return (
        <section className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                    Job Listings
                </h1>
                <div className="flex gap-2">
                    <button onClick={() => exportToCSV(jobs)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Export CSV</button>
                    <label className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors cursor-pointer">
                        Import CSV
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                    </label>
                    <Link href="/jobs/new" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">Add Job</Link>
                </div>
            </div>

            {importStatus && (
                <div className={`mb-4 p-4 rounded ${importStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {importStatus.success ? `Successfully imported ${importStatus.count} jobs.` : 'Import failed.'}
                    {importStatus.errors && (
                        <ul className="mt-2 text-sm list-disc list-inside">
                            {importStatus.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    )}
                    <button onClick={() => setImportStatus(null)} className="ml-4 font-bold">Close</button>
                </div>
            )}
            {
                jobs.length === 0 ? <p>No jobs found</p> :
                    <div className={"flex flex-col gap-4"}>
                        <ul className="grid grid-cols-1 gap-4">
                            {jobs.map(job =>
                                <li key={job.id} className="border border-gray-200 dark:border-gray-800 p-4 rounded-lg hover:shadow-md transition-shadow">
                                    <Link href={`/jobs/${job.id}`} className={`text-foreground flex justify-between items-center`}>
                                        <div>
                                            <h2 className="text-xl font-bold">{job.company}</h2>
                                            <p className="text-gray-600 dark:text-gray-400">{job.title}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </Link>
                                </li>
                            )
                            }
                        </ul>
                    </div>

            }
        </section>
    )
}


export default JobsPage;