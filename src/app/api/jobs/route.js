//route.js

import { executeQuery } from '../../lib/sqlitecloud';
import { Queries } from '../../constants/queries';

export async function GET(req) {
    const id = req.nextUrl.searchParams.get('id');
    const rows = id ? await executeQuery(Queries.GET_JOB_BY_ID, id): await executeQuery(Queries.GET_JOBS);
    return Response.json(rows);
}

export async function POST(req) {
    const { company, title, status='Applied', appliedAt=null, jobUrl=null, notes=null } = await req.json();
    await executeQuery(Queries.INSERT_JOB, company, title, status, appliedAt, jobUrl, notes);
    return Response.json({ ok: true }, { status: 201 });
}

export async function PUT(req) {
    const id = req.nextUrl.searchParams.get('id')
    const {company, title, status, appliedAt, jobUrl, notes } = await req.json();
    await executeQuery(Queries.UPDATE_JOB, company, title, status, appliedAt, jobUrl, notes, id);
    return Response.json({ ok: true }, { status: 200 });
}

export async function DELETE(req) {
    const { id } = await req.json();
    await executeQuery(Queries.DELETE_JOB, id);
    return Response.json({ ok: true }, { status: 200 });
}