import Link from "next/link";
import { useState, useEffect } from "react";
import { CreateJobSchema, UpdateJobSchema } from "@/schemas/JobSchema";

function Form({action, title, data}) {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        company: data?.company || "",
        title: data?.title || "",
        status: data?.status || "Applied",
        appliedAt: data?.appliedAt || "",
        jobUrl: data?.jobUrl || "",
        notes: data?.notes || ""
    });
    const [isValid, setIsValid] = useState(false);
    const [touched, setTouched] = useState({});

    useEffect(() => {
        const schema = data?.id ? UpdateJobSchema : CreateJobSchema;
        const result = schema.safeParse(data?.id ? { ...formData, id: data.id } : formData);
        setIsValid(result.success);
        if (result.success) {
            setErrors({});
        } else {
            setErrors(result.error.flatten().fieldErrors);
        }
    }, [formData, data?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    return (
        <>
            <form action={action} className="max-w-2xl mx-auto my-8 p-8 bg-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">

                <div className="flex flex-col gap-6">
                        {data && <input type="hidden" name="id" value={data?.id}/>}
                    {data &&
                        <Link href={`/jobs/${data?.id}`}
                                    className={"text-error text-right"}>
                        Cancel
                        </Link>}
                    <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">{title}</h1>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="company" className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Company</label>
                        <input
                            type="text"
                            id="company" 
                            name="company" 
                            className={`w-full px-4 py-2 rounded-lg border ${errors.company && touched.company ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                            placeholder="e.g. Acme Corp"
                            value={formData.company}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.company && touched.company && <p className="text-red-500 text-xs">{errors.company[0]}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Job Title</label>
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

                    <div className="flex flex-col gap-2">
                        <label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={formData.status}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.status && touched.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer`}
                        >
                            <option>Applied</option>
                            <option>Interview</option>
                            <option>Offer</option>
                            <option>Rejected</option>
                        </select>
                        {errors.status && touched.status && <p className="text-red-500 text-xs">{errors.status[0]}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="appliedAt" className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Applied at</label>
                            <input 
                                id="appliedAt" 
                                name="appliedAt" 
                                type="date"
                                className={`w-full px-4 py-2 rounded-lg border ${errors.appliedAt && touched.appliedAt ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                value={formData.appliedAt}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobUrl" className="text-sm font-semibold text-gray-700 dark:text-gray-300 const">Job URL</label>
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
                            {errors.jobUrl && touched.jobUrl && <p className="text-red-500 text-xs">{errors.jobUrl[0]}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</label>
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

                    <button 
                        type="submit"
                        disabled={!isValid}
                        className={`mt-4 w-full font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                        {data? "Update Application" : "Save Job Application" }
                    </button>
                </div>

            </form>
        </>
    )
}

export default Form