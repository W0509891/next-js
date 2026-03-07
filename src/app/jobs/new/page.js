'use client'
import {createJobAction} from "./actions";

const NewJobPage = () => {
    return (
        <form action={createJobAction} className={"gap-4 border-2 border-amber-50"}>

            <div className={"flex flex-col gap-4 p-4"}>
                <h1 className={"text-center"}>New Job</h1>

                <label htmlFor="">Company</label>
                <input type="text" name={"company"}/>

                <label htmlFor="">Job Title:</label>
                <input type="text" name={"title"}/>

                <label htmlFor="">Status</label>
                <select name="status" defaultValue={"Applied"}>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                </select>

                <label htmlFor="">Applied at:</label>
                    <input name={"appliedAt"} type={"date"}/>
                <label htmlFor="">Job URL</label>
                    <input name={"jobUrl"} type={"text"}/>

                <label htmlFor="">Notes: </label>
                <textarea name={"notes"} rows={"4"}/>

                <button  className={""} type={"submit"}>Save</button>
            </div>

        </form>
    )
}


export default NewJobPage;