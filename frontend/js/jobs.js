const API_BASE = window.location.origin;

let allJobs = [];

// ─── Immersive Cursor Glow ───────────────────────
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth follow with lerp
    function animate() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// ─── Interactive Particle System ─────────────────
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    const count = 70;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseSize: Math.random() * 2 + 0.8,
            size: 0,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.5 + 0.1,
            hue: Math.random() > 0.5 ? 239 : 187 // indigo or cyan
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Mouse repulsion and size boost
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 200) {
                const force = (200 - dist) / 200;
                p.x += (dx / dist) * force * 1.5;
                p.y += (dy / dist) * force * 1.5;
                p.size = p.baseSize + force * 3;
            } else {
                p.size += (p.baseSize - p.size) * 0.05;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 78%, 66%, ${p.opacity})`;
            ctx.fill();

            // Connection lines
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (d < 140) {
                    const alpha = 0.08 * (1 - d / 140);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `hsla(239, 78%, 66%, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
}

// ─── Typewriter Effect ───────────────────────────
function typewriterEffect(elementId, text, speed = 80) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// ─── Navbar Scroll Effect ────────────────────────
function initNavbarScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    });
}

// ─── Scroll to Top ───────────────────────────────
function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
}

// ─── IntersectionObserver Stagger ────────────────
function observeCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.job-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.07}s`;
        observer.observe(card);
    });
}

// ─── Card Mouse Tracking + Ripple ────────────────
function initCardEffects() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.job-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // Ripple on click
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.job-card');
        if (!card) return;

        let container = card.querySelector('.ripple-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'ripple-container';
            card.appendChild(container);
        }

        const rect = card.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        container.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
}

// ─── Animated Counter ────────────────────────────
function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(eased * target);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ─── Fetch & Render ──────────────────────────────
async function fetchJobs() {
    try {
        const res = await fetch(`${API_BASE}/jobs`);
        allJobs = await res.json();
        populateFilters(allJobs);
        updateHeroStats(allJobs);
        renderJobs(allJobs);
    } catch (err) {
        document.getElementById('jobsContainer').innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">😕</span>
                <h3>Unable to load jobs</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function updateHeroStats(jobs) {
    const departments = new Set(jobs.map(j => j.department));
    const locations = new Set(jobs.map(j => j.location));
    animateCounter('jobCount', jobs.length);
    animateCounter('deptCount', departments.size);
    animateCounter('locCount', locations.size);
}

function populateFilters(jobs) {
    const departments = [...new Set(jobs.map(j => j.department))].sort();
    const locations = [...new Set(jobs.map(j => j.location))].sort();

    const deptSelect = document.getElementById('filterDepartment');
    departments.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        deptSelect.appendChild(opt);
    });

    const locSelect = document.getElementById('filterLocation');
    locations.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l; opt.textContent = l;
        locSelect.appendChild(opt);
    });

    deptSelect.addEventListener('change', applyFilters);
    locSelect.addEventListener('change', applyFilters);
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', applyFilters);
}

function applyFilters() {
    const dept = document.getElementById('filterDepartment').value;
    const loc = document.getElementById('filterLocation').value;
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();

    let filtered = allJobs;
    if (dept) filtered = filtered.filter(j => j.department === dept);
    if (loc) filtered = filtered.filter(j => j.location === loc);
    if (search) {
        filtered = filtered.filter(j =>
            j.title.toLowerCase().includes(search) ||
            j.description.toLowerCase().includes(search) ||
            j.department.toLowerCase().includes(search)
        );
    }
    renderJobs(filtered);
}

function renderJobs(jobs) {
    const container = document.getElementById('jobsContainer');

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔍</span>
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

    requestAnimationFrame(() => observeCards());
}

// ─── Init ────────────────────────────────────────
initCursorGlow();
initParticles();
initNavbarScroll();
initScrollTop();
initCardEffects();
typewriterEffect('heroTitle', 'Join Our Team', 90);
fetchJobs();
