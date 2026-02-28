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

    for (let i = 0; i < 25; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseSize: Math.random() * 1.5 + 0.5,
            size: 0,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.3 + 0.05,
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
            if (dist < 160) {
                const force = (160 - dist) / 160;
                p.x += ((p.x - mouse.x) / dist) * force;
                p.y += ((p.y - mouse.y) / dist) * force;
                p.size = p.baseSize + force * 2;
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

// ─── Step Indicator ──────────────────────────────
function updateStepIndicator(step) {
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`step${i}`);
        const lineEl = document.getElementById(`line${i}`);
        if (!stepEl) continue;
        stepEl.classList.remove('active', 'completed');
        if (i < step) stepEl.classList.add('completed');
        else if (i === step) stepEl.classList.add('active');
        if (lineEl) lineEl.classList.toggle('completed', i < step);
    }
}

// ─── Drag & Drop File Upload ─────────────────────
function initFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('resume');
    const fileNameEl = document.getElementById('fileName');
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            showFileName(e.dataTransfer.files[0].name);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) showFileName(fileInput.files[0].name);
    });

    function showFileName(name) {
        fileNameEl.textContent = `📎 ${name}`;
        fileNameEl.style.display = 'block';
        dropZone.querySelector('.upload-text').innerHTML = 'File selected — click to change';
        updateStepIndicator(3);
    }
}

// ─── Form Focus Step Tracking ────────────────────
function initFormTracking() {
    const personalFields = ['name', 'email', 'phone'];
    const docFields = ['resume', 'coverLetter', 'linkedin', 'github'];

    personalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('focus', () => updateStepIndicator(1));
    });

    docFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('focus', () => updateStepIndicator(2));
    });

    const checkStep = () => {
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        if (name && email && phone) updateStepIndicator(2);
    };

    personalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('blur', checkStep);
    });
}

// ─── Success Animation ──────────────────────────
function showSuccessAnimation() {
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-checkmark">✓</div>
        <h2>Application Submitted!</h2>
        <p>We'll review your application and get back to you soon.</p>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.6s ease';
        setTimeout(() => overlay.remove(), 600);
    }, 3000);
}

// ─── Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    if (jobId) {
        document.getElementById('jobId').value = jobId;
        loadJobTitle(jobId);
    }
    initFileUpload();
    initFormTracking();
    updateStepIndicator(1);
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
    const linkedin = document.getElementById('linkedin') ? document.getElementById('linkedin').value : '';
    const github = document.getElementById('github') ? document.getElementById('github').value : '';
    formData.append('portfolioLinks', `LinkedIn: ${linkedin} | GitHub: ${github}`);

    try {
        const res = await fetch(`${API_BASE}/applications/apply`, { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok) {
            showSuccessAnimation();
            alertBox.innerHTML = `<div class="alert alert-success">✅ ${data.message}. We'll be in touch soon!</div>`;
            document.getElementById('applyForm').reset();
            const fileNameEl = document.getElementById('fileName');
            if (fileNameEl) {
                fileNameEl.style.display = 'none';
                const uploadText = document.querySelector('.upload-text');
                if (uploadText) uploadText.innerHTML = 'Drag & drop your resume here or <strong>browse</strong>';
            }
            updateStepIndicator(1);
        } else {
            alertBox.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        }
    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">❌ Something went wrong. Please try again.</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application →';
    }
});

initCursorGlow();
initParticles();
initNavbarScroll();
