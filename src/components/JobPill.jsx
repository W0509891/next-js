'use client'
import {statusColor} from "@/schemas/Style";
import {useRouter} from "next/navigation";
import Svg from "./Svg";
import {deleteJobAction, updateStatusAction} from "@/app/lib/actions";
import {useState, useEffect} from "react";

function JobPill({job, onEdit, onClick}) {

    const router = useRouter();
    const [status, setStatus] = useState(job.status);
    useEffect(() => {
        setStatus(job.status);
    }, [job.status]);
    const handleStatusChange = async (jobId, newStatus) => {
        try {
            setStatus(newStatus);
            await updateStatusAction(jobId, newStatus);
            router.refresh();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <>
            <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
                <div className={`text-foreground flex justify-between items-center cursor-pointer`}>
                    <div onClick={onClick}>
                        <h2 className="text-xl font-bold">{job.company}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{job.title}</p>
                    </div>
                    <div className="flex items-center w-1/5 justify-between *:cursor-pointer">
                        <button className={"hover:text-teal-300"}
                                onClick={onEdit}>
                            <Svg use="/edit.svg" className="w-6 h-6" />
                        </button>
                        <button className={"hover:text-red-300"}
                                onClick={async () => {
                                    if(confirm("Are you sure you want to delete this job?")) {
                                        await deleteJobAction(job.id);
                                        router.refresh();
                                    }
                                }}
                        >
                            <Svg use="/delete.svg" className="w-6 h-6" />
                        </button>

                        <select name="status" id="status"
                                className={`rounded-full px-2 py-1 cursor-pointer outline-none
                                 transition-colors ${statusColor(status)}`}
                                value={status}
                                onChange={e => handleStatusChange(job.id, e.target.value)}
                        >
                            {["Applied", "Interview", "Offer", "Rejected"].map(status => (
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