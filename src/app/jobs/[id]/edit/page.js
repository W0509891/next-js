'use client'

import {updateJobAction} from "../actions";
import Form from "@/components/Form";
import {useEffect, useState, use} from "react";

const EditJobPage = ({params}) => {
    const resolvedParams = use(params);
    const jobId = resolvedParams.id;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/jobs?id=${jobId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    setJob(data[0]);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching job:", error);
                setLoading(false);
            });
    }, [jobId]);

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!job) {
        return <div className="p-8 text-center">Job not found.</div>;
    }

    return (
        <Form action={updateJobAction} title={"Edit Job"} data={job}/>
    );
}

export default EditJobPage;