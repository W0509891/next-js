import { useState, useEffect } from "react";
import { Copy, Check, Edit2 } from "lucide-react";
import { statusColor } from "@/schemas/Style";
import { updateStatusAction } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

export const JobDetails = ({ job, onEdit, onClose }) => {
    const router = useRouter();
    const [status, setStatus] = useState(job.status);
    const [copiedId, setCopiedId] = useState(false);

    useEffect(() => {
        setStatus(job.status);
    }, [job.status]);

    const handleStatusChange = async (newStatus) => {
        try {
            setStatus(newStatus);
            await updateStatusAction(job.id, newStatus);
            router.refresh();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        });
    };

    return (
        <div className="flex flex-col h-full bg-surface text-foreground">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.company}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{job.title}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                <DetailItem label="Status" isStatus={true} status={status} handleStatusChange={handleStatusChange} />
                <DetailItem label="Company" value={job.company} onEditClick={onEdit} />
                <DetailItem label="Job Title" value={job.title} onEditClick={onEdit} />
                <DetailItem label="Applied At" value={new Date(job.appliedAt).toLocaleString()} onEditClick={onEdit} />
                <DetailItem label="Job URL" value={job.jobUrl} onEditClick={onEdit} />
                <DetailItem label="Notes" value={job.notes} onEditClick={onEdit} />
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">ID & Last Updated</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono text-xs">{job.id}</span>
                        <button 
                            onClick={() => copyToClipboard(job.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                            title="Copy ID"
                        >
                            {copiedId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span>{new Date(job.updatedAt).toLocaleString()}</span>
                    </div>
                </div>
                <button 
                    onClick={onEdit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                    <Edit2 size={16} /> Edit All
                </button>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, onEditClick, isStatus = false, status, handleStatusChange }) => (
    <div className="flex flex-col gap-1 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</span>
            {onEditClick && (
                <button 
                    onClick={onEditClick}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-blue-500"
                >
                    <Edit2 size={14} />
                </button>
            )}
        </div>
        {isStatus ? (
            <select 
                value={status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`mt-1 self-start rounded-full px-3 py-1 text-sm font-medium outline-none transition-colors appearance-none cursor-pointer ${statusColor(status)}`}
            >
                {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                    <option key={s} value={s} className={statusColor(s)}>
                        {s}
                    </option>
                ))}
            </select>
        ) : (
            <span className="text-gray-900 dark:text-gray-100 break-all">{value || "N/A"}</span>
        )}
    </div>
);
