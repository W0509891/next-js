'use client'
import {statusColor} from "@/schemas/Style";
import {useRouter} from "next/navigation";
import Svg from "./Svg";
import {deleteJobAction, updateStatusAction} from "@/app/lib/actions";
import {useState, useEffect} from "react";
import {STATUSES} from "@/app/lib/constants";

function JobPill({job, onEdit, onDelete, onClick ,onStatusChange}) {

    const router = useRouter();
    const [status, setStatus] = useState(job.status);
    useEffect(() => {
        setStatus(job.status);
    }, [job.status]);
    const handleStatusChange = async (jobId, newStatus) => {
        try {
            await updateStatusAction(jobId, newStatus);
            setStatus(newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <>
            <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 text-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div onClick={onClick} className="min-w-0 flex-1 cursor-pointer">
                        <h2 className="break-words text-lg font-bold sm:text-xl">{job.company}</h2>
                        <p className="break-words text-gray-600 dark:text-gray-400">{job.title}</p>
                    </div>
                    <div className="flex w-full items-center justify-end gap-4 sm:w-auto sm:gap-3">
                        <button className="p-1 hover:text-teal-300"
                                onClick={onEdit}>
                            <Svg use="/edit.svg" className="w-6 h-6" />
                        </button>
                        <button className="p-1 hover:text-red-300"
                                onClick={onDelete}
                        >
                            <Svg use="/delete.svg" className="w-6 h-6" />
                        </button>

                        <select name="status" id="status"
                                className={`max-w-full rounded-full px-2 py-2 cursor-pointer outline-none
                                 transition-colors ${statusColor(status)}`}
                                value={status}
                                onChange={e => handleStatusChange(job.id, e.target.value)}
                        >
                            {STATUSES.map(status => (
                                <option key={status} value={status}
                                        className={statusColor(status)}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </>
    )
}

export default JobPill