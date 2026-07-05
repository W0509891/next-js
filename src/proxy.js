import {NextResponse} from 'next/server'

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(';');

function getCorsHeaders(origin) {
    const isExtension = origin?.startsWith('chrome-extension://');
    const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };


    if (allowedOrigins.includes(origin) || isExtension) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
}

export const proxy = async (req) => {
    const origin = req.headers.get('origin');
    const headers = getCorsHeaders(origin);

    if (req.method === 'OPTIONS') {
        return NextResponse.json({}, { status: 200, headers: headers});
    }

    if (req.method === "POST" || req.method === "DELETE") {
        (req.method === "POST") ?
            console.log("POST request received 1")
            : console.log("DELETE request received 1")

        const ctype = req.headers.get('content-type') || '';

        if (ctype.includes('application/json')) {
            const body = await req.json();
            console.log('JSON body:', body);

        } else if (ctype.includes('multipart/form-data')) {
            const fd = await req.formData();
            const logged = {};
            for (const [key, value] of fd.entries()) {
                if (typeof value === 'string') {
                    logged[key] = value;
                } else {
                    // value is a File
                    logged[key] = {
                        type: 'file',
                        name: value.name,
                        size: value.size,
                        mime: value.type,
                    };
                }
            }
            console.log('Data Reveived is valid');
        } else {
            // Fallback: buffer or text
            const buf = Buffer.from(await req.arrayBuffer());
            console.log('Raw body:', { size: buf.length, preview: buf.subarray(0, 64).toString('hex') });
        }

        const response = NextResponse.next();
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
        return response;
    }

    const response = NextResponse.next();
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
}


