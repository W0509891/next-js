'use client'

import {useState, useEffect} from "react";
import {createJobAction, deleteJobAction, exportToCSV, importFromCSV, updateJobAction} from "../lib/actions";
import JobPill from "@/components/JobPill";
import Form from "@/components/Form";
import {JobDetails} from "@/components/JobDetails";
const JobsPage = () => {


    function loadSettings() {
        if (typeof window === 'undefined') return {
            lastPage: 1,
            statusFilter: "All",
            lastSortConfig: {key: "updatedAt", direction: "desc"}
        };

        return {
            lastPage: Number(localStorage.getItem('lastPage')) || 1,
            statusFilter: localStorage.getItem('statusFilter') ?? "All",
            lastSortConfig: JSON.parse(localStorage.getItem('lastSortConfig')) ?? {key: "updatedAt", direction: "desc"}
        };
    }

    const [jobs, setJobs] = useState([])
    const [importStatus, setImportStatus] = useState(null);

    // Filter, Sort, Search, Pagination State
    const settings = loadSettings();
    const [showNewJob, showNewJobModal] = useState(false);
    const [showUpdateJob, showUpdateJobModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(() => settings.statusFilter);
    const [sortConfig, setSortConfig] = useState(() => settings.lastSortConfig);
    const [currentPage, setCurrentPage] = useState(() => settings.lastPage);
    const [pageSize, setPageSize] = useState(5);

    const saveSettings = () => {
        localStorage.setItem('lastPage', currentPage.toString());
        localStorage.setItem('statusFilter', statusFilter.toString());
        localStorage.setItem('lastSortConfig', JSON.stringify(sortConfig));
    };

    const loadJobs = () => {
        fetch('/api/jobs', {method: "GET"})
            .then(response => response.json())
            .then(data => {
                setJobs(data)
            })
    }

    useEffect(() => {
        loadJobs();
    }, [])

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    })
        .sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aValue = a[sortConfig.key] || "";
            const bValue = b[sortConfig.key] || "";

            if (aValue < bValue) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }

            if (aValue > bValue) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });

    const totalPages = Math.ceil(filteredJobs.length / pageSize);
    const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset page if filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sortConfig]);

    useEffect(() => {
        const handleClick = (e) => {
            const link = e.target.closest('a');
            if (link) saveSettings();
        };

        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        }
    }, [currentPage, statusFilter, sortConfig])

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

    const handleDelete = async (jobId) => {
        if (confirm("Are you sure you want to delete this job?")) {
            await deleteJobAction(jobId);
        }
        setJobs(filteredJobs.filter(job => job.id !== jobId));
    };

    const handleClick = (job) => {
        if (job) {
            setSelectedJob(job);
            setShowDetails(true);
        }
    }

    const handleEdit = (job) => {
        if (job) {
            setSelectedJob(job);
            showUpdateJobModal(true);
        }
    }

    const handleAddJob = async (formData) => {
        const res = await createJobAction(formData);
        if (res.status) {
            showNewJobModal(false);
            setJobs([...jobs, res.data]);
        }
    }

    const handleUpdateJob = async (formData) => {

        const res = await updateJobAction(formData);
        if (res.status) {
            showUpdateJobModal(false);
            setSelectedJob(null);
            setJobs(jobs.map(job => job.id === res.data.id ? res.data : job))
        }
    };
    return (
        <section className="max-w-4xl mx-auto p-4 relative">
            {showNewJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => showNewJobModal(false)}
                    ></div>
                    <div
                        className="relative z-10 w-full max-w-2xl bg-surface h-3/4 rounded-xl shadow-2xl overflow-hidden">
                        <Form
                            action={async (formData) => await handleAddJob(formData)}
                            title={"Add New Job"}
                            onCancel={() => showNewJobModal(false)}
                        />
                    </div>
                </div>
            )}

            {showUpdateJob && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            showUpdateJobModal(false);
                            setSelectedJob(null);
                        }}
                    ></div>
                    <div
                        className="relative z-10 w-full max-w-2xl bg-surface h-3/4 rounded-xl shadow-2xl overflow-hidden">
                        <Form
                            action={async (formData) => handleUpdateJob(formData)}
                            title={"Update Job"}
                            data={selectedJob}
                            onCancel={() => {
                                showUpdateJobModal(false);
                                setSelectedJob(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {showDetails && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            setShowDetails(false);
                            setSelectedJob(null);
                        }}
                    ></div>
                    <div
                        className="relative z-10 w-full max-w-2xl bg-surface h-3/4 rounded-xl shadow-2xl overflow-hidden">
                        <JobDetails
                            job={selectedJob}
                            onClose={() => {
                                setShowDetails(false);
                                setSelectedJob(null);
                            }}
                            onEdit={() => {
                                setShowDetails(false);
                                showUpdateJobModal(true);
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                    Job Listings
                </h1>
                <div className="flex flex-wrap gap-2 justify-center text-foreground">
                    <button className="px-4 py-2   rounded hover:bg-blue-300 transition-colors">
                        <a href="/api/download/db">Download DB</a>
                    </button>
                    <button className="px-4 py-2   rounded hover:bg-green-700 transition-colors">
                        <a href="/api/download/csv?q=all">Export CSV</a>
                    </button>
                    <button className="px-4 py-2   rounded hover:bg-green-500 transition-colors">
                        <a href="/api/download/csv?q=daily">Get Today</a>
                    </button>

                    <label className="px-4 py-2 rounded hover:bg-yellow-700 transition-colors cursor-pointer">
                        Import CSV
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden"/>
                    </label>
                    <div onClick={() => showNewJobModal(!showNewJob)}
                         className="px-4 py-2  rounded hover:bg-indigo-700 transition-colors">
                        Add Job
                    </div>
                </div>
            </div>

            {/* Filter/Sort Controls */}
            <div
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col gap-1 text-foreground">
                    <label className="text-xs font-semibold uppercase text-gray-500">Search</label>
                    <input
                        type="text"
                        placeholder="Company or Title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1 text-foreground">
                    <label className="text-xs font-semibold uppercase text-gray-500">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1 text-foreground">
                    <label className="text-xs font-semibold uppercase text-gray-500">Sort By</label>
                    <div className="flex gap-1">
                        <select
                            value={sortConfig.key}
                            onChange={(e) => setSortConfig(prev => ({...prev, key: e.target.value}))}
                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="updatedAt">Date Updated</option>
                            <option value="company">Company</option>
                            <option value="title">Job Title</option>
                        </select>
                        <button
                            onClick={() => setSortConfig(prev => ({
                                ...prev,
                                direction: prev.direction === 'asc' ? 'desc' : 'asc'
                            }))}
                            className="px-3 py-2 bg-surface rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            title={sortConfig.direction === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                        >
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            {importStatus && (
                <>
                    {importStatus.success && (
                        <div
                            className={`mb-4 p-4 rounded bg-green-100 text-green-800`}>
                            {`Successfully imported ${importStatus.count} jobs.`}
                            <button onClick={() => setImportStatus(null)} className="ml-4 font-bold">Close</button>
                        </div>
                    )}

                    {importStatus.errors && (
                        <div
                            className={'mb-4 p-4 rounded bg-red-100 text-red-800'}>
                            <ul className="mt-2 text-sm list-disc list-inside">
                                {importStatus.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                            <button onClick={() => setImportStatus(null)} className="ml-4 font-bold">Close</button>
                        </div>
                    )}
                </>
            )}
            {
                paginatedJobs.length === 0 ?
                    <p className="text-center py-10 text-gray-500">No jobs match your criteria.</p> :
                    <div className={"flex flex-col gap-6"}>
                        <div className="grid grid-cols-1 gap-4">
                            {paginatedJobs.map(job =>
                                <JobPill
                                    key={job.id}
                                    job={job}
                                    onClick={() => handleClick(job)}
                                    onEdit={() => handleEdit(job)}
                                    onDelete={async () => handleDelete(job.id)}
                                />
                            )
                            }
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div
                                className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing <span
                                    className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span
                                    className="font-medium">{Math.min(currentPage * pageSize, filteredJobs.length)}</span> of <span
                                    className="font-medium">{filteredJobs.length}</span> results
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border  text-foreground border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border text-foreground rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
            }
        </section>
    )
}


export default JobsPage;