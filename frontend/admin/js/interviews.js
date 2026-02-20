// API_BASE and getAuthHeaders() are provided by auth.js

async function loadApplications() {
    try {
        const res = await fetch(`${API_BASE}/admin/applications`, {
            headers: getAuthHeaders()
        });

        if (res.status === 401) return logout();

        const apps = await res.json();
        const select = document.getElementById('applicationSelect');

        // Show only applications that are shortlisted or applied (eligible for interview)
        const eligible = apps.filter(a => ['Applied', 'Shortlisted'].includes(a.status));

        if (eligible.length === 0) {
            select.innerHTML = '<option value="">No eligible applications</option>';
            return;
        }

        select.innerHTML = '<option value="">Select an application...</option>';
        eligible.forEach(app => {
            const opt = document.createElement('option');
            opt.value = app._id;
            opt.textContent = `${app.name} – ${app.jobId ? app.jobId.title : 'N/A'} (${app.status})`;
            select.appendChild(opt);
        });
    } catch (err) {
        document.getElementById('applicationSelect').innerHTML =
            '<option value="">Failed to load applications</option>';
    }
}

document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const alertBox = document.getElementById('alertBox');
    alertBox.innerHTML = '';

    const data = {
        applicationId: document.getElementById('applicationSelect').value,
        scheduledDate: document.getElementById('scheduledDate').value,
        meetingLink: document.getElementById('meetingLink').value,
        notes: document.getElementById('interviewNotes').value
    };

    if (!data.applicationId) {
        alertBox.innerHTML = `<div class="alert alert-error">❌ Please select an application</div>`;
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/interview/schedule`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (res.status === 401) return logout();

        const result = await res.json();

        if (res.ok) {
            alertBox.innerHTML = `<div class="alert alert-success">✅ ${result.message}</div>`;
            document.getElementById('scheduleForm').reset();
            loadApplications(); // Refresh list
        } else {
            alertBox.innerHTML = `<div class="alert alert-error">❌ ${result.message}</div>`;
        }
    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">❌ Failed to schedule interview</div>`;
    }
});

loadApplications();
