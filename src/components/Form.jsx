import {statusColor} from "@/schemas/Style";
import Link from "next/link";
import {useState, useEffect} from "react";
import {CreateJobSchema, UpdateJobSchema, ValidateFile} from "@/schemas/JobSchema";
import {stringify_date} from "@/app/lib/helpers";
import {STATUSES} from "../app/lib/constants.ts";
import * as z from "zod";

function Form({action, title, data, onCancel}) {


    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        company: data?.company || "",
        title: data?.title || "",
        status: data?.status || "Applied",
        appliedAt: stringify_date(data?.appliedAt),
        jobUrl: data?.jobUrl || "",
        notes: data?.notes || "",
        jobPostingPdf: data?.jobPostingPdf || undefined,
        jobPostingHtml: data?.jobPostingHtml || undefined,
        usedResume: data?.usedResume || undefined,
        usedCoverLetter: data?.usedCoverLetter || undefined
    });
    const [isValid, setIsValid] = useState(false);
    const [touched, setTouched] = useState({});

    useEffect(() => {
        const schema = data?.id ? UpdateJobSchema : CreateJobSchema;
        const result = schema.safeParse(data?.id ? {...formData, id: data.id} : formData);
        setIsValid(result.success);
        if (result.success) {
            setErrors({});
        } else {
            setErrors(result.error.flatten().fieldErrors);
        }
    }, [formData, data?.id]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const ok = ValidateFile.safeParse(file).success;
            if (ok) {
                setFormData(prev => ({...prev, [e.target.name]: file}));
                setErrors(prev => ({...prev, [e.target.name]: undefined}));
            } else {
                setErrors(prev => ({...prev, [e.target.name]: ["Only PDF or HTML files are allowed"]}));
            }
            console.log(formData)
        }
    }

    const handleBlur = (e) => {
        const {name} = e.target;
        setTouched(prev => ({...prev, [name]: true}));
    };

    const handleSubmit = async (e) => {
        // Let Next.js handle it if action is provided
        e.preventDefault();
        const schema = data?.id ? UpdateJobSchema : CreateJobSchema;
        const result = schema.safeParse(data?.id ? {...formData, id: data.id} : formData);

        if (result.success) {
            action(result.data);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <form onSubmit={handleSubmit} encType={"multipart/form-data"} className="bg-surface text-foreground
            rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
                        {onCancel ? (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        ) : data && (
                            <Link href={`/jobs/${data?.id}`} className={"text-error"}>
                                Cancel
                            </Link>
                        )}
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2 ">
                            <label htmlFor="company"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Company</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                className={`w-full px-4 py-2 rounded-lg border ${errors.company && touched.company ?
                                    'border-red-500' :
                                    'border-gray-300 dark:border-gray-700'} bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                placeholder="e.g. Acme Corp"
                                value={formData.company}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {errors.company && touched.company &&
                                <p className="text-red-500 text-xs">{errors.company[0]}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="title"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Job
                                Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className={`w-full px-4 py-2 rounded-lg border ${errors.title && touched.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                placeholder="e.g. Software Engineer"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {errors.title && touched.title && <p className="text-red-500 text-xs">{errors.title[0]}</p>}
                        </div>
                    </div>


                    <div className="flex flex-col gap-2">
                        <label htmlFor="status"
                               className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.status && touched.status ?
                                'border-red-500' :
                                'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 focus:ring-2
                                 focus:ring-blue-500 focus:border-transparent outline-none transition-all 
                                 appearance-none cursor-pointer ${statusColor(formData.status)}`}
                        >
                            {STATUSES.map(status => (
                                <option key={status} className={statusColor(status)}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        {errors.status && touched.status && <p className="text-red-500 text-xs">{errors.status[0]}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="appliedAt"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Applied
                                at</label>
                            <input
                                id="appliedAt"
                                name="appliedAt"
                                type="datetime-local"
                                className={`w-full px-4 py-2 rounded-lg border ${errors.appliedAt && touched.appliedAt ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                value={formData.appliedAt}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {errors.appliedAt && touched.appliedAt &&
                                <p className="text-red-500 text-xs">{errors.appliedAt}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobUrl"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Job
                                URL</label>
                            <input
                                id="jobUrl"
                                name="jobUrl"
                                type="text"
                                className={`w-full px-4 py-2 rounded-lg border ${errors.jobUrl && touched.jobUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                placeholder="https://..."
                                value={formData.jobUrl}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {errors.jobUrl && touched.jobUrl &&
                                <p className="text-red-500 text-xs">{errors.jobUrl[0]}</p>}
                        </div>
                    </div>

                    {/* Resume upload (optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="flex flex-col gap-2">
                            <label htmlFor="usedResume"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resume (PDF or
                                HTML, optional)</label>
                            <input
                                id="usedResume"
                                name="usedResume"
                                type="file"
                                accept=".pdf,.html,text/html,application/pdf"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                onChange={handleFileChange}
                            />
                            {errors.usedResume && <p className="text-red-500 text-xs">{errors.usedResume[0]}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="usedCoverLetter"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cover Letter (PDF or
                                HTML, optional)</label>
                            <input
                                id="usedCoverLetter"
                                name="usedCoverLetter"
                                type="file"
                                accept=".pdf,.html,text/html,application/pdf"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                onChange={handleFileChange}
                            />
                            {errors.usedCoverLetter && <p className="text-red-500 text-xs">{errors.usedCoverLetter[0]}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobPostingHtml"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300">JobPosting (HTML, optional)</label>
                            <input
                                id="jobPostingHtml"
                                name="jobPostingHtml"
                                type="file"
                                accept=".html,text/html"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                onChange={handleFileChange}
                            />
                            {errors.jobPostingHtml && <p className="text-red-500 text-xs">{errors.jobPostingHtml[0]}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobPostingPdf"
                                   className="text-sm font-semibold text-gray-700 dark:text-gray-300">JobPosting (PDF optional)</label>
                            <input
                                id="jobPostingPdf"
                                name="jobPostingPdf"
                                type="file"
                                accept=".pdf,application/pdf"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                onChange={handleFileChange}
                            />
                            {errors.jobPostingPdf && <p className="text-red-500 text-xs">{errors.jobPostingPdf[0]}</p>}
                        </div>
                    </div>


                    {/*
                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes"
                               className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="4"
                            className={`w-full px-4 py-2 rounded-lg border ${errors.notes && touched.notes ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none`}
                            placeholder="Add any details about the application..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>
*/}

                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`mt-4 w-full font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                        {data ? "Update Application" : "Save Job Application"}
                    </button>
                    {data?.id && <input type="hidden" name="id" value={data.id}/>}
                </div>

            </form>
        </div>
    )
}

export default Form