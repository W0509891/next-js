import {UpdateJobSchema} from "@/schemas/JobSchema.js";
import {executeQuery, updateJobAction, uploadToBlobStorage} from "@/app/lib/actions.js";
import { Queries } from "@/app/lib/queries";
import {NextResponse} from "next/server";

const allowedDocumentFields = [
    "resume_used",
    "posting_pdf",
    "cover_letter",
    "posting_html",
];

export async function PUT(req, {params}) {
    console.log("PUT request received 1")
    const {id, path} = await params
    if (!id || !path) {
        return Response.json({error: {message: "Invalid id or path"}}, {status: 400,});
    }

    //receive file
    const form = await req.formData()
    const file = form.get("file")

    if (!file || typeof file !== "object" || file.size === 0) {
        return Response.json(
            { error: { message: "Invalid file" } },
            { status: 400 }
        );
    }

    const rows = await executeQuery(Queries.GET_JOB_BY_ID, id);
    const job = Array.isArray(rows) ? rows[0] : rows;

    if (!job) {
        return NextResponse.json(
            { error: { message: "Job not found" } },
            { status: 404 }
        );
    }

    const url = await uploadToBlobStorage(
        {
            company: job.company,
            jobId: id,
            title: job.title,
        },
        file
    );

    await executeQuery(Queries.UPDATE_JOB([path]), url, id);

    return Response.json(
        {
            ok: true,
            field: path,
            url,
        },
        { status: 200 }
    );
}