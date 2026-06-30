import {readFile} from "node:fs/promises";
import path from "node:path";
import {dbPath} from "@/app/lib/sqlite";

export async function GET() {

    try {
        const fileBuffer = await readFile(dbPath);

        return new Response(fileBuffer, {
            headers: {
                "Content-Type": "application/vnd.sqlite3",
                "Content-Disposition": 'attachment; filename="jobs.sqlite"',
                "Content-Length": fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("Failed to download database:", error);

        return Response.json(
            {success: false, message: "Failed to download database"},
            {status: 500}
        );
    }
}