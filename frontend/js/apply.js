const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');

    if (jobId) {
        document.getElementById('jobId').value = jobId;
        loadJobTitle(jobId);
    }
});

async function loadJobTitle(jobId) {
    try {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`);
        const job = await res.json();
        document.getElementById('jobTitle').textContent = `Applying for: ${job.title}`;
        document.title = `Apply – ${job.title} – HireFlow`;
    } catch (err) {
        document.getElementById('jobTitle').textContent = 'Position';
    }
}

document.getElementById('applyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const alertBox = document.getElementById('alertBox');
    alertBox.innerHTML = '';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData();
    formData.append('jobId', document.getElementById('jobId').value);
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('resume', document.getElementById('resume').files[0]);
    formData.append('coverLetter', document.getElementById('coverLetter').value);
    formData.append('portfolioLinks', document.getElementById('portfolioLinks').value);

    try {
        const res = await fetch(`${API_BASE}/applications/apply`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alertBox.innerHTML = `<div class="alert alert-success">✅ ${data.message}. We'll be in touch soon!</div>`;
            document.getElementById('applyForm').reset();
        } else {
            alertBox.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        }
    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">❌ Something went wrong. Please try again.</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }
});
