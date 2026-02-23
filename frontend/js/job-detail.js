const API_BASE = window.location.origin;

// ─── Cursor Glow ─────────────────────────────────
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    function animate() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// ─── Interactive Particles ───────────────────────
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

    for (let i = 0; i < 35; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseSize: Math.random() * 1.5 + 0.5,
            size: 0,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.4 + 0.08,
            hue: Math.random() > 0.5 ? 239 : 187
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dist < 180) {
                const force = (180 - dist) / 180;
                p.x += ((p.x - mouse.x) / dist) * force * 1.2;
                p.y += ((p.y - mouse.y) / dist) * force * 1.2;
                p.size = p.baseSize + force * 2.5;
            } else {
                p.size += (p.baseSize - p.size) * 0.05;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 78%, 66%, ${p.opacity})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// ─── Navbar Scroll ───────────────────────────────
function initNavbarScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 60); });
}

// ─── Load Job Detail ─────────────────────────────
async function loadJobDetail() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    if (!jobId) {
        document.getElementById('jobDetail').innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔗</span>
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
            <div class="breadcrumb" style="animation: fadeInUp 0.5s ease-out 0s both;">
                <a href="/">Home</a>
                <span class="separator">›</span>
                <a href="/">Jobs</a>
                <span class="separator">›</span>
                <span>${job.title}</span>
            </div>
            <h1 style="animation: fadeInUp 0.5s ease-out 0.05s both;">${job.title}</h1>
            <div class="meta-row" style="animation: fadeInUp 0.5s ease-out 0.1s both;">
                <span class="tag tag-dept">📁 ${job.department}</span>
                <span class="tag tag-loc">📍 ${job.location}</span>
                <span class="tag tag-type">💼 ${job.employmentType}</span>
            </div>

            <section style="animation: fadeInUp 0.5s ease-out 0.15s both;">
                <h3>Description</h3>
                <p>${job.description}</p>
            </section>

            <section style="animation: fadeInUp 0.5s ease-out 0.2s both;">
                <h3>Requirements</h3>
                <p>${job.requirements}</p>
            </section>

            <div style="margin-top: 36px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; animation: fadeInUp 0.5s ease-out 0.25s both;">
                <a href="apply.html?jobId=${job._id}" class="btn btn-primary" style="font-size: 1rem; padding: 16px 40px;">
                    Apply Now →
                </a>
                <button class="share-btn" onclick="shareJob()">
                    🔗 Share this Job
                </button>
            </div>
        `;

    } catch (err) {
        document.getElementById('jobDetail').innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">😕</span>
                <h3>Job not found</h3>
                <p><a href="/" style="color: var(--primary-light);">← Back to all jobs</a></p>
            </div>
        `;
    }
}

function shareJob() {
    const btn = document.querySelector('.share-btn');
    navigator.clipboard.writeText(window.location.href).then(() => {
        btn.innerHTML = '✅ Link Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = '🔗 Share this Job'; btn.classList.remove('copied'); }, 2000);
    }).catch(() => {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        btn.innerHTML = '✅ Link Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = '🔗 Share this Job'; btn.classList.remove('copied'); }, 2000);
    });
}

initCursorGlow();
initParticles();
initNavbarScroll();
loadJobDetail();
