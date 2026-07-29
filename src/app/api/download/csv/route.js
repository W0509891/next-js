import {readFile} from "node:fs/promises";
import path from "node:path";
import {exportToCSV} from "@/app/lib/actions"

export async function GET(req) {

    try {
        const q = req.nextUrl.searchParams.get('q');
        const timeframe = req.nextUrl.searchParams.get('timeframe');
        console.log("Query Params:",  q, timeframe)
        const csv = await exportToCSV(q, parseInt(timeframe));
        if (csv.message) {
            return Response.json(
                {success: false, message: csv.message},
                {status: 500}
            );
        }
        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": 'attachment; filename="jobs.csv"',
                "Content-Length": csv.size,
            },
        });
    } catch (error) {
        console.error("Failed to download csv sheet:", error);

        return Response.json(
            {success: false, message: "Failed to download csv sheet"},
            {status: 500}
        );
    }
}