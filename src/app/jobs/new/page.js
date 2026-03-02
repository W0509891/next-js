import {createJobAction} from "./actions";
const NewJobPage = () => {
    return (
        <form action={ createJobAction }>
            <h1>New Job</h1>

            <label htmlFor="">Company <input type="text" name={"company"}/></label>
            <label htmlFor="">Job Title: <input type="text" name={"title"}/></label>
            <label htmlFor="">Status</label>
            <select name="status" defaultValue={"Applied"}>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
            </select>
            <label htmlFor="">Applied at: <input name={"appliedAt"} type={"date"}/></label>
            <label htmlFor="">Job URL <input name={"jobUrl"} type={"text"}/></label>
            <label htmlFor="">Notes: </label>
            <textarea name={"notes"} rows={"4"}/>

            <button type={"submit"}>Save</button>
        </form>
    )
}


export default NewJobPage;