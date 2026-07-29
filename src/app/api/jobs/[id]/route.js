import {UpdateJobSchema} from "@/schemas/JobSchema.js";
import {updateJobAction} from "@/app/lib/actions.js";

export async function PATCH(req) {
    console.log("PATCH request received 1")
    const body = await req.json();
    const result = UpdateJobSchema.safeParse({ ...body});
    console.log(result)

    if (!result.success) {
        return Response.json({ errors: result.error.flatten() }, { status: 400,  });
    }

    const res = await updateJobAction(body)
    if (!res.status){
        return Response.json({ errors: res.errors }, { status: 400,  });
    }

    return Response.json({ ok: res.status, data: res.data }, { status: 200,  });
}