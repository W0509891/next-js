import {NextResponse} from 'next/server'

export const proxy = async (req) => {
    if (req.method === "POST" || req.method === "DELETE") {
        const ctype = req.headers.get('content-type') || '';

        if (ctype.includes('application/json')) {
            const body = await req.json();
            console.log('JSON body:', safeStringify(body));
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
            console.log('FormData (sanitized):', JSON.stringify(logged));
        } else {
            // Fallback: buffer or text
            const buf = Buffer.from(await req.arrayBuffer());
            console.log('Raw body:', { size: buf.length, preview: buf.subarray(0, 64).toString('hex') });
        }

        return NextResponse.next()
    }
}


