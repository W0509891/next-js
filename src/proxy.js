import {NextResponse} from 'next/server'

export const proxy = async (req) => {
    if (req.method === "POST" || req.method === "DELETE") {
        const payload  = await req.json();
        console.log(new Date(), payload);
        return NextResponse.next()
    }
}


