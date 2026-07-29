import {executeQuery} from "../lib/sqlite";
import {Queries} from "@/app/lib/queries";
import {metrics as JobMetrics} from "@/schemas/JobSchema";

export default async function DashboardPage() {
    const metricsData = await executeQuery(Queries.GET_METRICS);
    const metrics = metricsData[0] || JobMetrics;

    const statusData = [
        { label: 'Total', count: metrics.totalJobs, color: 'bg-gray-500' },
        { label: 'Drafts', count: 0, color: 'bg-gray-500' },
        { label: 'No Response', count: 0, color: 'bg-gray-500' },
        { label: 'Applied', count: metrics.appliedCount, color: 'bg-blue-500' },
        { label: 'Interview', count: metrics.interviewCount, color: 'bg-yellow-500' },
        { label: 'Offer', count: metrics.offerCount, color: 'bg-green-500' },
        { label: 'Rejected', count: metrics.rejectedCount, color: 'bg-red-500' },
    ];

    const maxCount = Math.max(...statusData.map(d => d.count), 1);

    return (
        <div className="mx-auto w-full max-w-5xl p-0 sm:p-4 lg:p-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white sm:mb-8 sm:text-3xl">Dashboard</h1>

            {/* Quick Stats Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-10 lg:grid-cols-4 lg:gap-6">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalJobs}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interviews</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.interviewCount}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applied (this week)</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{metrics.appliedThisWeek}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interviews (this week)</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{metrics.interviewsThisWeek}</p>
                </div>
            </div>

            {/* Visualizations*/}
            <div className="grid grid-cols-1 gap-8">
                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:p-8">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Application Status Distribution</h2>
                    
                    {/* A Bar Chart */}
                    <div
                        className="space-y-5 sm:space-y-6"
                        role="img" 
                        aria-label="Bar chart showing distribution of job application statuses"
                    >
                        {statusData.map((item) => (
                            <div key={item.label} className="relative pt-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full ${item.color} mr-2`}></span>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            {item.count} ({Math.round((item.count / (metrics.totalJobs || 1)) * 100)}%)
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-100 dark:bg-gray-700">
                                    <div
                                        style={{ width: `${(item.count / metrics.totalJobs) * 100}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${item.color} transition-all duration-500 ease-out`}
                                        aria-valuenow={item.count}
                                        aria-valuemin="0"
                                        aria-valuemax={maxCount}
                                        role="progressbar"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
