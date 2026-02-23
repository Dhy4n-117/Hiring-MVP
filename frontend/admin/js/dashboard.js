// API_BASE, getAuthHeaders(), showToast() are provided by auth.js
let allApplications = [];
let currentAppId = null;

// ─── Welcome Text ────────────────────────────────
function initWelcome() {
    const el = document.getElementById('welcomeText');
    if (!el) return;
    const name = localStorage.getItem('adminName') || 'Admin';
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    el.textContent = `${greeting}, ${name} • ${dateStr}`;
}

// ─── Animated Counter ────────────────────────────
function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 25));
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = current;
    }, 35);
}

// ─── Load Dashboard ──────────────────────────────
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
            `<tr><td colspan="6" class="empty-state"><span class="empty-icon">😕</span> Failed to load applications</td></tr>`;
    }
}

function updateStats(apps) {
    animateCounter('statTotal', apps.length);
    animateCounter('statShortlisted', apps.filter(a => a.status === 'Shortlisted').length);
    animateCounter('statInterview', apps.filter(a => a.status === 'Interview Scheduled' || a.status === 'Interviewed').length);
    animateCounter('statHired', apps.filter(a => a.status === 'Hired').length);
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

    // Search input
    const searchInput = document.getElementById('searchCandidate');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function applyFilters() {
    const jobId = document.getElementById('filterJob').value;
    const status = document.getElementById('filterStatus').value;
    const search = (document.getElementById('searchCandidate')?.value || '').toLowerCase();

    let filtered = allApplications;
    if (jobId) filtered = filtered.filter(a => a.jobId && a.jobId._id === jobId);
    if (status) filtered = filtered.filter(a => a.status === status);
    if (search) {
        filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(search) ||
            a.email.toLowerCase().includes(search)
        );
    }

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
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><span class="empty-icon">📭</span> No applications found</td></tr>`;
        return;
    }

    tbody.innerHTML = apps.map((app, i) => `
        <tr style="animation: fadeInUp 0.4s ease-out ${0.03 * i}s both; cursor: pointer;" onclick="showCandidateDetail('${app._id}')">
            <td>
                <strong>${app.name}</strong><br>
                <span style="color: var(--text-muted); font-size: 0.8rem;">${app.email}</span>
            </td>
            <td>${app.jobId ? app.jobId.title : 'N/A'}</td>
            <td><span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span></td>
            <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
            <td><a href="${API_BASE}${app.resumeUrl}" target="_blank" class="btn btn-secondary btn-sm" onclick="event.stopPropagation()">📄 View</a></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openStatusModal('${app._id}', '${app.name}', '${app.status}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

// ─── Candidate Detail Modal ──────────────────────
function showCandidateDetail(id) {
    const app = allApplications.find(a => a._id === id);
    if (!app) return;

    const detailEl = document.getElementById('candidateDetail');
    detailEl.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Name</div>
            <div class="detail-value">${app.name}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Email</div>
            <div class="detail-value">${app.email}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${app.phone || 'N/A'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Job</div>
            <div class="detail-value">${app.jobId ? app.jobId.title : 'N/A'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status</div>
            <div class="detail-value"><span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Applied</div>
            <div class="detail-value">${new Date(app.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        ${app.coverLetter ? `
        <div class="detail-row">
            <div class="detail-label">Cover Letter</div>
            <div class="detail-value">${app.coverLetter}</div>
        </div>` : ''}
        ${app.portfolioLinks ? `
        <div class="detail-row">
            <div class="detail-label">Portfolio</div>
            <div class="detail-value"><a href="${app.portfolioLinks}" target="_blank" style="color: var(--primary-light);">${app.portfolioLinks}</a></div>
        </div>` : ''}
        <div class="detail-row">
            <div class="detail-label">Resume</div>
            <div class="detail-value"><a href="${API_BASE}${app.resumeUrl}" target="_blank" class="btn btn-secondary btn-sm">📄 Download Resume</a></div>
        </div>
    `;

    document.getElementById('candidateModal').classList.add('active');
}

// ─── Status Modal ────────────────────────────────
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

    try {
        const res = await fetch(`${API_BASE}/admin/application/status/${currentAppId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });

        const data = await res.json();

        if (res.ok) {
            showToast(data.message || 'Status updated successfully', 'success');
            closeModal('statusModal');
            loadDashboard();
        } else {
            showToast(data.message || 'Failed to update status', 'error');
        }
    } catch (err) {
        showToast('Failed to update status', 'error');
    }
}

// ─── Init ────────────────────────────────────────
initWelcome();
loadDashboard();
