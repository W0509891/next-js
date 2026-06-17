import Link from "next/link";

export default function Home() {
    return (

        <>
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
                Welcome Back...
            </h1>
            <p className="max-w-md text-lg leading-8 text-muted mb-8">
                Manage your job applications efficiently and track your progress.
            </p>

            <div className="flex flex-wrap gap-4">
                <Link 
                    href="/dashboard" 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    View Dashboard
                </Link>
                <Link 
                    href="/jobs" 
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                    Browse Jobs
                </Link>
            </div>
        </>

    );
}
