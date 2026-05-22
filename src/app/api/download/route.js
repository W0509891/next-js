import {readFile} from "node:fs/promises";
import path from "node:path";

export async function GET() {
    const dbPath = path.resolve(process.cwd(), "jobs.sqlite");

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