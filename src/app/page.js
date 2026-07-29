import Link from "next/link";

export default function Home() {
    return (

        <>
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground sm:text-4xl">
                Welcome Back...
            </h1>
            <p className="mb-8 max-w-md text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Manage your job applications efficiently and track your progress.
            </p>

            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link 
                    href="/dashboard" 
                    className="w-full px-6 py-3 text-center bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm sm:w-auto"
                >
                    View Dashboard
                </Link>
                <Link 
                    href="/jobs" 
                    className="w-full px-6 py-3 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm sm:w-auto"
                >
                    Browse Jobs
                </Link>
            </div>
        </>

    );
}
