import {getCompaniesAction} from "@/app/lib/actions";
import {NextResponse} from "next/server";


export async function GET(req) {
    const companies = await getCompaniesAction().then(res => res.flatMap(c => c.company));
    return NextResponse.json({ companies: companies })
}