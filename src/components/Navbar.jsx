import  Link from "next/link";
function Navbar() {

    return (
        <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium sm:gap-x-6 sm:text-base">
            <Link className="py-1 hover:text-blue-600" href="/">Home</Link>
            <Link className="py-1 hover:text-blue-600" href="/jobs">Jobs</Link>
            <Link className="py-1 hover:text-blue-600" href="/dashboard">Dashboard</Link>
        </nav>
    )
}

export default Navbar