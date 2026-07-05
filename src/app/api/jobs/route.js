//route.js

import { executeQuery } from '@/app/lib/sqlite';
import { Queries } from '@/app/lib/queries';
import { CreateJobSchema, UpdateJobSchema } from '@/schemas/JobSchema';
import {NextResponse} from "next/server";
import {createJobAction} from "@/app/lib/actions.js";

export async function GET(req) {
    const id = req.nextUrl.searchParams.get('id');
    const rows = id ? await executeQuery(Queries.GET_JOB_BY_ID, id) : await executeQuery(Queries.GET_JOBS_NOT_REJECTED);
    return NextResponse.json(rows, {  });
}

export async function POST(req) {
    console.log("POST request received 2")
    const fd = await req.formData();
    const body = () => {
        const data = {};
        for (const [key, value] of fd.entries()) {
            if (key === "appliedAt") {
                data[key] = parseInt(value) ?? value;
            }
            else {
                data[key] = value;
            }
        }
        return data;
    }
    const result = CreateJobSchema.safeParse(body());

    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten() }, { status: 400});
    }

    const response = await createJobAction(result.data)
    if (!response.status){
        console.log("response failed", response)
        return NextResponse.json({ errors: response.errors }, { status: 400,  });
    }

    console.log("response good", response)
    return NextResponse.json({ ok: response.status, data: response.data }, { status: 201,  });
}

export async function PUT(req) {
    const id = req.nextUrl.searchParams.get('id');
    const body = await req.json();
    console.log(body)
    const result = UpdateJobSchema.safeParse({ ...body, id });
    console.log("Result", result)

    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten() }, { status: 400,  });
    }

    const updatableFields = ["company", "title", "status", "appliedAt", "jobUrl", "notes"];
    const data = {};
    for (const field of updatableFields) {
        if (body.hasOwnProperty(field)) {
            data[field] = result.data[field];
        }
    }

    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length > 0) {
        await executeQuery(Queries.UPDATE_JOB(fields), ...values, id);
    }
    
    return NextResponse.json({ ok: true }, { status: 200,  });
}

export async function DELETE(req) {
    const { id } = await req.json();
    await executeQuery(Queries.DELETE_JOB, id);
    return NextResponse.json({ ok: true }, { status: 200,  });
}