//route.js

import { executeQuery } from '../../lib/sqlite';
import { Queries } from '../../constants/queries';
import { CreateJobSchema, UpdateJobSchema } from '@/schemas/JobSchema';
import {NextResponse} from "next/server";

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(';');

function getCorsHeaders(req) {
    const origin = req.headers.get('origin');
    const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
}

export async function OPTIONS(req) {
    return NextResponse.json({}, { status: 200, headers: getCorsHeaders(req) });
}

export async function GET(req) {
    const id = req.nextUrl.searchParams.get('id');
    const rows = id ? await executeQuery(Queries.GET_JOB_BY_ID, id) : await executeQuery(Queries.GET_JOBS_NOT_REJECTED);
    return NextResponse.json(rows, { headers: getCorsHeaders(req) });
}

export async function POST(req) {
    const body = await req.json();
    const result = CreateJobSchema.safeParse(body);
    
    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten() }, { status: 400, headers: getCorsHeaders(req) });
    }

    const { company, title, status, appliedAt, jobUrl, notes } = result.data;
    const id = crypto.randomUUID();
    await executeQuery(Queries.INSERT_JOB, id, company, title, status, appliedAt, jobUrl, notes);
    return NextResponse.json({ ok: true, id }, { status: 201, headers: getCorsHeaders(req) });
}

export async function PUT(req) {
    const id = req.nextUrl.searchParams.get('id');
    const body = await req.json();
    console.log(body)
    const result = UpdateJobSchema.safeParse({ ...body, id });
    console.log("Result", result)

    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten() }, { status: 400, headers: getCorsHeaders(req) });
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
    
    return NextResponse.json({ ok: true }, { status: 200, headers: getCorsHeaders(req) });
}

export async function DELETE(req) {
    const { id } = await req.json();
    await executeQuery(Queries.DELETE_JOB, id);
    return NextResponse.json({ ok: true }, { status: 200, headers: getCorsHeaders(req) });
}