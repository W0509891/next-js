import Link from "next/link";

function Form({action, title, data}) {

    return (
        <>
            <form action={action} className="max-w-2xl mx-auto my-8 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">

                <div className="flex flex-col gap-6">
                        {data && <input type="hidden" name="id" value={data?.id}/>}
                    {data &&
                        <Link href={`/jobs/${data?.id}`}
                                    className={"text-red-500 text-right"}>
                        Cancel
                        </Link>}
                    <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">{title}</h1>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="company" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company</label>
                        <input 
                            type="text" 
                            id="company" 
                            name="company" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Acme Corp"
                            defaultValue={data?.company}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job Title</label>
                        <input 
                            type="text" 
                            id="title" 
                            name="title" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Software Engineer"
                            defaultValue={data?.title}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            defaultValue={data?.status}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option>Applied</option>
                            <option>Interview</option>
                            <option>Offer</option>
                            <option>Rejected</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="appliedAt" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Applied at</label>
                            <input 
                                id="appliedAt" 
                                name="appliedAt" 
                                type="date"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                defaultValue={data?.appliedAt}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobUrl" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job URL</label>
                            <input 
                                id="jobUrl" 
                                name="jobUrl" 
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="https://..."
                                defaultValue={data?.jobUrl}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</label>
                        <textarea 
                            id="notes" 
                            name="notes" 
                            rows="4"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Add any details about the application..."
                            defaultValue={data?.notes}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 cursor-pointer"
                    >
                        {data? "Update Application" : "Save Job Application" }
                    </button>
                </div>

            </form>
        </>
    )
}

export default Form