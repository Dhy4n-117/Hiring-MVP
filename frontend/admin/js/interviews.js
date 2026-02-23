// API_BASE, getAuthHeaders(), showToast() are provided by auth.js

// ─── Load Eligible Applications ──────────────────
async function loadApplications() {
    try {
        const res = await fetch(`${API_BASE}/admin/applications`, {
            headers: getAuthHeaders()
        });
        if (res.status === 401) return logout();

        const apps = await res.json();
        const select = document.getElementById('applicationSelect');

        const eligible = apps.filter(a =>
            a.status === 'Applied' || a.status === 'Shortlisted'
        );

        if (eligible.length === 0) {
            select.innerHTML = '<option value="">No eligible applications</option>';
        } else {
            select.innerHTML = '<option value="">Select an application...</option>';
            eligible.forEach(app => {
                const opt = document.createElement('option');
                opt.value = app._id;
                opt.textContent = `${app.name} — ${app.jobId ? app.jobId.title : 'Unknown'}`;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        document.getElementById('applicationSelect').innerHTML =
            '<option value="">Failed to load</option>';
    }
}

// ─── Load Upcoming Interviews ────────────────────
async function loadUpcomingInterviews() {
    const timeline = document.getElementById('interviewTimeline');
    if (!timeline) return;

    try {
        // We'll get interviews through applications that have "Interview Scheduled" status
        const res = await fetch(`${API_BASE}/admin/applications`, {
            headers: getAuthHeaders()
        });
        if (res.status === 401) return logout();

        const apps = await res.json();
        const scheduled = apps.filter(a => a.status === 'Interview Scheduled');

        if (scheduled.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📅</span>
                    <p>No upcoming interviews scheduled.</p>
                </div>`;
            return;
        }

        timeline.innerHTML = scheduled.map((app, i) => {
            const date = new Date(app.updatedAt || app.appliedAt);
            const day = date.getDate();
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="interview-item" style="animation-delay: ${0.05 * i}s;">
                    <div class="time-block">
                        <div class="date">${day}</div>
                        <div class="month">${month}</div>
                        <div class="time">${time}</div>
                    </div>
                    <div class="interview-details">
                        <div class="candidate-name">${app.name}</div>
                        <div class="job-title">${app.jobId ? app.jobId.title : 'Unknown Position'}</div>
                        <span class="badge badge-interview" style="margin-top: 6px;">Interview Scheduled</span>
                    </div>
                </div>`;
        }).join('');
    } catch (err) {
        timeline.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">😕</span>
                <p>Failed to load interviews.</p>
            </div>`;
    }
}

// ─── Schedule Form Handler ───────────────────────
document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Scheduling...';

    const body = {
        applicationId: document.getElementById('applicationSelect').value,
        scheduledDate: document.getElementById('scheduledDate').value,
        meetingLink: document.getElementById('meetingLink').value,
        notes: document.getElementById('interviewNotes').value
    };

    if (!body.applicationId) {
        showToast('Please select an application', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '📅 Schedule Interview';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/interview/schedule`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });

        if (res.status === 401) return logout();

        const data = await res.json();

        if (res.ok) {
            showToast(data.message || 'Interview scheduled successfully!', 'success');
            e.target.reset();
            loadApplications();
            loadUpcomingInterviews();
        } else {
            showToast(data.message || 'Failed to schedule', 'error');
        }
    } catch (err) {
        showToast('Failed to schedule interview', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '📅 Schedule Interview';
    }
});

// ─── Init ────────────────────────────────────────
loadApplications();
loadUpcomingInterviews();
