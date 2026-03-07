'use client'


const createJobAction = async (formData) => {
    const company = formData.get("company")
    const title = formData.get("title")
    const status = formData.get("status")
    const appliedAt = formData.get("appliedAt")
    const jobUrl = formData.get("jobUrl")
    const notes = formData.get("notes")

    //execute database query to insert new job
    await fetch('/api/jobs/', {
        method: 'POST',
        body: JSON.stringify({company, title, status, appliedAt, jobUrl, notes}),
    }).then(response => response.json()
        .then(data => console.log(data))
    )

    redirect('/jobs')
};


export {createJobAction}