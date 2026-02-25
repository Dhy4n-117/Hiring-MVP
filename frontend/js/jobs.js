const API = '';
let allJobs = [];

// Fetch and render jobs
async function fetchJobs() {
  try {
    const res = await fetch(`${API}/jobs`);
    const data = await res.json();

    // Handle both { success, data } format and raw array format
    const jobs = Array.isArray(data) ? data : (data.success ? data.data : []);
    allJobs = jobs;
    populateFilters(allJobs);
    renderJobs(allJobs);
  } catch (err) {
    document.getElementById('jobsContainer').innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Could not load jobs</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

// Populate filter dropdowns
function populateFilters(jobs) {
  const departments = [...new Set(jobs.map((j) => j.department))];
  const locations = [...new Set(jobs.map((j) => j.location))];

  const deptSelect = document.getElementById('filterDepartment');
  departments.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    deptSelect.appendChild(opt);
  });

  const locSelect = document.getElementById('filterLocation');
  locations.forEach((l) => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    locSelect.appendChild(opt);
  });
}

// Render job cards
function renderJobs(jobs) {
  const container = document.getElementById('jobsContainer');

  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔍</div>
        <h3>No jobs found</h3>
        <p>Try adjusting your filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = jobs
    .map(
      (job) => `
    <div class="job-card" onclick="window.location.href='/job.html?id=${job._id}'">
      <div class="job-card-header">
        <h3>${job.title}</h3>
        <span class="department-badge">${job.department}</span>
      </div>
      <div class="job-card-meta">
        <span>📍 ${job.location}</span>
        <span>💼 ${job.employmentType}</span>
      </div>
      <p>${job.description}</p>
      <div class="job-card-footer">
        <button class="view-btn">View Details →</button>
        <span class="date">${timeAgo(job.createdAt)}</span>
      </div>
    </div>
  `
    )
    .join('');
}

// Filter handler
function applyFilters() {
  const dept = document.getElementById('filterDepartment').value;
  const loc = document.getElementById('filterLocation').value;

  let filtered = allJobs;
  if (dept) filtered = filtered.filter((j) => j.department === dept);
  if (loc) filtered = filtered.filter((j) => j.location === loc);

  renderJobs(filtered);
}

// Time ago helper
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Event listeners
document.getElementById('filterDepartment').addEventListener('change', applyFilters);
document.getElementById('filterLocation').addEventListener('change', applyFilters);

// Init
fetchJobs();
