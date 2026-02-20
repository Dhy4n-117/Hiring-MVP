// API_BASE and getAuthHeaders() are provided by auth.js
let editMode = false;

async function loadJobs() {
    try {
        const res = await fetch(`${API_BASE}/jobs`);
        const jobs = await res.json();
        renderJobs(jobs);
    } catch (err) {
        document.getElementById('jobsTable').innerHTML =
            `<tr><td colspan="6" class="empty-state">Failed to load jobs</td></tr>`;
    }
}

function renderJobs(jobs) {
    const tbody = document.getElementById('jobsTable');

    if (jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No jobs yet. Create your first job posting!</td></tr>`;
        return;
    }

    tbody.innerHTML = jobs.map(job => `
        <tr>
            <td><strong>${job.title}</strong></td>
            <td>${job.department}</td>
            <td>${job.location}</td>
            <td>${job.employmentType}</td>
            <td><span class="badge ${job.isActive ? 'badge-hired' : 'badge-rejected'}">${job.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick='openEditModal(${JSON.stringify(job)})'>✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteJob('${job._id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openCreateModal() {
    editMode = false;
    document.getElementById('modalTitle').textContent = 'Create Job';
    document.getElementById('editJobId').value = '';
    document.getElementById('jobTitleInput').value = '';
    document.getElementById('jobDepartment').value = '';
    document.getElementById('jobLocation').value = '';
    document.getElementById('jobType').value = 'Full-time';
    document.getElementById('jobDescription').value = '';
    document.getElementById('jobRequirements').value = '';
    document.getElementById('jobModal').classList.add('active');
}

function openEditModal(job) {
    editMode = true;
    document.getElementById('modalTitle').textContent = 'Edit Job';
    document.getElementById('editJobId').value = job._id;
    document.getElementById('jobTitleInput').value = job.title;
    document.getElementById('jobDepartment').value = job.department;
    document.getElementById('jobLocation').value = job.location;
    document.getElementById('jobType').value = job.employmentType;
    document.getElementById('jobDescription').value = job.description;
    document.getElementById('jobRequirements').value = job.requirements;
    document.getElementById('jobModal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

async function saveJob() {
    const alertBox = document.getElementById('alertBox');
    const jobData = {
        title: document.getElementById('jobTitleInput').value,
        department: document.getElementById('jobDepartment').value,
        location: document.getElementById('jobLocation').value,
        employmentType: document.getElementById('jobType').value,
        description: document.getElementById('jobDescription').value,
        requirements: document.getElementById('jobRequirements').value
    };

    try {
        let res;
        if (editMode) {
            const id = document.getElementById('editJobId').value;
            res = await fetch(`${API_BASE}/admin/job/update/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(jobData)
            });
        } else {
            res = await fetch(`${API_BASE}/admin/job/create`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(jobData)
            });
        }

        if (res.status === 401) return logout();

        const data = await res.json();

        if (res.ok) {
            alertBox.innerHTML = `<div class="alert alert-success">✅ ${data.message}</div>`;
            closeModal('jobModal');
            loadJobs();
            setTimeout(() => alertBox.innerHTML = '', 3000);
        } else {
            alertBox.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        }
    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">❌ Failed to save job</div>`;
    }
}

async function deleteJob(id) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    const alertBox = document.getElementById('alertBox');

    try {
        const res = await fetch(`${API_BASE}/admin/job/delete/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.status === 401) return logout();

        const data = await res.json();

        if (res.ok) {
            alertBox.innerHTML = `<div class="alert alert-success">✅ ${data.message}</div>`;
            loadJobs();
            setTimeout(() => alertBox.innerHTML = '', 3000);
        } else {
            alertBox.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        }
    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">❌ Failed to delete job</div>`;
    }
}

loadJobs();
