'use client'

import Link from "next/link";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {exportToCSV, exportToPDF, importFromCSV} from "./actions";
import {statusColor} from "@/schemas/Style";

const JobsPage = () => {

    const [jobs, setJobs] = useState([])
    const [importStatus, setImportStatus] = useState(null);

    // Filter, Sort, Search, Pagination State
    const settings = loadSettings();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(settings.statusFilter ?? "All");
    const [sortConfig, setSortConfig] = useState(settings.lastSortConfig ?? { key: "updatedAt", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(settings.lastPage ?? 1);
    const [pageSize, setPageSize] = useState(5);

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
            console.log(a, b)
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
        const handleWindowClose = (e) => {
            e.preventDefault()
            saveSettings()
        }

        document.addEventListener('click', handleClick);
        window.addEventListener('beforeunload', handleWindowClose)
        return () => {
            window.removeEventListener('beforeunload', handleWindowClose)
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

    function loadSettings(){
        const lastPage = Number(localStorage.getItem('lastPage')) ?? null;
        const statusFilter = localStorage.getItem('statusFilter') ?? null;
        const lastSortConfig = JSON.parse(localStorage.getItem('lastSortConfig')) ?? null;

        return {lastPage, statusFilter, lastSortConfig};
    }

    function saveSettings(){
        localStorage.setItem('lastPage', currentPage.toString());
        localStorage.setItem('statusFilter', statusFilter.toString());
        localStorage.setItem('lastSortConfig', JSON.stringify(sortConfig));
    }
    return (
        <section className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                    Job Listings
                </h1>
                <div className="flex flex-wrap gap-2 justify-center text-foreground">
                    <button onClick={() => exportToCSV(jobs)} className="px-4 py-2   rounded hover:bg-green-700 transition-colors">Export CSV</button>
                    <label className="px-4 py-2 rounded hover:bg-yellow-700 transition-colors cursor-pointer">
                        Import CSV
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                    </label>
                    <Link href="/jobs/new" className="px-4 py-2  rounded hover:bg-indigo-700 transition-colors">Add Job</Link>
                </div>
            </div>

            {/* Filter/Sort Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-800">
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
                            onChange={(e) => setSortConfig(prev => ({ ...prev, key: e.target.value }))}
                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="updatedAt">Date Updated</option>
                            <option value="company">Company</option>
                            <option value="title">Job Title</option>
                        </select>
                        <button
                            onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                            className="px-3 py-2 bg-surface rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            title={sortConfig.direction === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                        >
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
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
                paginatedJobs.length === 0 ? <p className="text-center py-10 text-gray-500">No jobs match your criteria.</p> :
                    <div className={"flex flex-col gap-6"}>
                        <ul className="grid grid-cols-1 gap-4">
                            {paginatedJobs.map(job =>
                                <li key={job.id} className="border border-gray-200 dark:border-gray-800 p-4 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
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

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, filteredJobs.length)}</span> of <span className="font-medium">{filteredJobs.length}</span> results
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