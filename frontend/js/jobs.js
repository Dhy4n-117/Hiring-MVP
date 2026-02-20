const API_BASE = window.location.origin;

let allJobs = [];

async function fetchJobs() {
    try {
        const res = await fetch(`${API_BASE}/jobs`);
        allJobs = await res.json();
        populateFilters(allJobs);
        renderJobs(allJobs);
    } catch (err) {
        document.getElementById('jobsContainer').innerHTML = `
            <div class="empty-state">
                <h3>Unable to load jobs</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function populateFilters(jobs) {
    const departments = [...new Set(jobs.map(j => j.department))].sort();
    const locations = [...new Set(jobs.map(j => j.location))].sort();

    const deptSelect = document.getElementById('filterDepartment');
    departments.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        deptSelect.appendChild(opt);
    });

    const locSelect = document.getElementById('filterLocation');
    locations.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l;
        opt.textContent = l;
        locSelect.appendChild(opt);
    });

    deptSelect.addEventListener('change', applyFilters);
    locSelect.addEventListener('change', applyFilters);
}

function applyFilters() {
    const dept = document.getElementById('filterDepartment').value;
    const loc = document.getElementById('filterLocation').value;

    let filtered = allJobs;
    if (dept) filtered = filtered.filter(j => j.department === dept);
    if (loc) filtered = filtered.filter(j => j.location === loc);

    renderJobs(filtered);
}

function renderJobs(jobs) {
    const container = document.getElementById('jobsContainer');

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No jobs found</h3>
                <p>Try adjusting your filters or check back later.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = jobs.map(job => `
        <div class="job-card" onclick="window.location.href='job.html?id=${job._id}'">
            <h3>${job.title}</h3>
            <div class="job-meta">
                <span class="tag tag-dept">📁 ${job.department}</span>
                <span class="tag tag-loc">📍 ${job.location}</span>
                <span class="tag tag-type">💼 ${job.employmentType}</span>
            </div>
            <p class="description">${job.description}</p>
            <span class="apply-link">View Details →</span>
        </div>
    `).join('');
}

fetchJobs();
