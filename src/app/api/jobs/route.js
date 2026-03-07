//route.js

import { executeQuery } from '../../lib/sqlitecloud';
import { Queries } from '../../constants/queries';

export async function GET() {
    const rows = await executeQuery(GET_JOBS);
    return Response.json(rows);
}

export async function POST(req) {
    const { company, title, status='Applied', appliedAt=null, jobUrl=null, notes=null } = await req.json();
    await executeQuery(INSERT_JOB, company, title, status, appliedAt, jobUrl, notes);
    return Response.json({ ok: true }, { status: 201 });
}