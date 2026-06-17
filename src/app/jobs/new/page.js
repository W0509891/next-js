'use client'
import {createJobAction} from "../../lib/actions";
import Form from "@/components/Form";

const NewJobPage = () => {
    return (
        <Form action={createJobAction} title={"Add New Job"}/>
    )
}


export default NewJobPage;