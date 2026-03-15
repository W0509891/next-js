'use client'
import {createJobAction} from "./actions";
import Form from "@/components/Form";

const NewJobPage = () => {
    return (
        <Form action={createJobAction} title={"Add New Job"}/>
    )
}


export default NewJobPage;