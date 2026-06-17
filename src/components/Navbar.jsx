import  Link from "next/link";
function Navbar() {

    return (
        <nav className={"flex gap-4 h-2/3"}>
            <Link href="/">Home</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/dashboard">Dashboard</Link>
        </nav>
    )
}

export default Navbar