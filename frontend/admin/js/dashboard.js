// API_BASE and getAuthHeaders() are provided by auth.js
let allApplications = [];
let currentAppId = null;

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/admin/applications`, {
            headers: getAuthHeaders()
        });

        if (res.status === 401) return logout();

        allApplications = await res.json();
        updateStats(allApplications);
        populateJobFilter(allApplications);
        renderApplications(allApplications);
    } catch (err) {
        document.getElementById('applicationsTable').innerHTML =
            `<tr><td colspan="6" class="empty-state">Failed to load applications</td></tr>`;
    }
}

function updateStats(apps) {
    document.getElementById('statTotal').textContent = apps.length;
    document.getElementById('statShortlisted').textContent = apps.filter(a => a.status === 'Shortlisted').length;
    document.getElementById('statInterview').textContent = apps.filter(a => a.status === 'Interview Scheduled' || a.status === 'Interviewed').length;
    document.getElementById('statHired').textContent = apps.filter(a => a.status === 'Hired').length;
}

function populateJobFilter(apps) {
    const select = document.getElementById('filterJob');
    const jobs = {};
    apps.forEach(a => {
        if (a.jobId) jobs[a.jobId._id] = a.jobId.title;
    });
    Object.entries(jobs).forEach(([id, title]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = title;
        select.appendChild(opt);
    });

    select.addEventListener('change', applyFilters);
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
}

function applyFilters() {
    const jobId = document.getElementById('filterJob').value;
    const status = document.getElementById('filterStatus').value;

    let filtered = allApplications;
    if (jobId) filtered = filtered.filter(a => a.jobId && a.jobId._id === jobId);
    if (status) filtered = filtered.filter(a => a.status === status);

    renderApplications(filtered);
}

function getStatusBadgeClass(status) {
    const map = {
        'Applied': 'badge-applied',
        'Shortlisted': 'badge-shortlisted',
        'Interview Scheduled': 'badge-interview',
        'Interviewed': 'badge-interviewed',
        'Offer Sent': 'badge-offer',
        'Hired': 'badge-hired',
        'Rejected': 'badge-rejected'
    };
    return map[status] || 'badge-applied';
}

function renderApplications(apps) {
    const tbody = document.getElementById('applicationsTable');

    if (apps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No applications found</td></tr>`;
        return;
    }

    tbody.innerHTML = apps.map(app => `
        <tr>
            <td>
                <strong>${app.name}</strong><br>
                <span style="color: var(--text-muted); font-size: 0.8rem;">${app.email}</span>
            </td>
            <td>${app.jobId ? app.jobId.title : 'N/A'}</td>
            <td><span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span></td>
            <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
            <td><a href="${API_BASE}${app.resumeUrl}" target="_blank" class="btn btn-secondary btn-sm">📄 View</a></td>
            <td><button class="btn btn-primary btn-sm" onclick="openStatusModal('${app._id}', '${app.name}', '${app.status}')">Edit</button></td>
        </tr>
    `).join('');
}

function openStatusModal(id, name, currentStatus) {
    currentAppId = id;
    document.getElementById('modalCandidate').value = name;
    document.getElementById('modalStatus').value = currentStatus;
    document.getElementById('statusModal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

async function saveStatus() {
    const status = document.getElementById('modalStatus').value;
    const alertBox = document.getElementById('alertBox');

    try {
        const res = await fetch(`${API_BASE}/admin/application/status/${currentAppId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });

        const data = await res.json();

        if (res.ok) {
            alertBox.innerHTML = `<div class="alert alert-success">✅ ${data.message}</div>`;
            closeModal('statusModal');
            loadDashboard();
            setTimeout(() => alertBox.innerHTML = '', 3000);
        } else {
            alertBox.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        }
    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">❌ Failed to update status</div>`;
    }
}

loadDashboard();
