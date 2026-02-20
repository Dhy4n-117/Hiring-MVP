const API_BASE = window.location.origin;

async function loadJobDetail() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    if (!jobId) {
        document.getElementById('jobDetail').innerHTML = `
            <div class="empty-state">
                <h3>No job specified</h3>
                <p><a href="/" style="color: var(--primary-light);">← Back to all jobs</a></p>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`);
        if (!res.ok) throw new Error('Job not found');

        const job = await res.json();
        document.title = `${job.title} – HireFlow`;

        document.getElementById('jobDetail').innerHTML = `
            <a href="/" style="color: var(--primary-light); font-size: 0.9rem; display: inline-block; margin-bottom: 20px;">← Back to all jobs</a>
            <h1>${job.title}</h1>
            <div class="meta-row">
                <span class="tag tag-dept">📁 ${job.department}</span>
                <span class="tag tag-loc">📍 ${job.location}</span>
                <span class="tag tag-type">💼 ${job.employmentType}</span>
            </div>

            <section>
                <h3>Description</h3>
                <p>${job.description}</p>
            </section>

            <section>
                <h3>Requirements</h3>
                <p>${job.requirements}</p>
            </section>

            <div style="margin-top: 32px;">
                <a href="apply.html?jobId=${job._id}" class="btn btn-primary" style="font-size: 1rem; padding: 14px 32px;">
                    Apply Now →
                </a>
            </div>
        `;
    } catch (err) {
        document.getElementById('jobDetail').innerHTML = `
            <div class="empty-state">
                <h3>Job not found</h3>
                <p><a href="/" style="color: var(--primary-light);">← Back to all jobs</a></p>
            </div>
        `;
    }
}

loadJobDetail();
