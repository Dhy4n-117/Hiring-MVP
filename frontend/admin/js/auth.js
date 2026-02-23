const API_BASE = window.location.origin;

// ─── Auth Check ──────────────────────────────────
if (localStorage.getItem('token') && !window.location.pathname.includes('login')) {
    // Already authenticated
} else if (!localStorage.getItem('token') && !window.location.pathname.includes('login')) {
    window.location.href = '/admin/login.html';
}

// ─── Interactive Login Canvas ────────────────────
function initLoginCanvas() {
    const canvas = document.getElementById('login-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

    for (let i = 0; i < 55; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseSize: Math.random() * 2 + 0.5,
            size: 0,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.35 + 0.05,
            hue: Math.random() > 0.6 ? 239 : Math.random() > 0.3 ? 187 : 270 // indigo, cyan, or purple
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

            // Mouse interaction - attract gently
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 200) {
                const force = (200 - dist) / 200;
                p.x += (dx / dist) * force * 0.8;
                p.y += (dy / dist) * force * 0.8;
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
                if (d < 150) {
                    const alpha = 0.06 * (1 - d / 150);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `hsla(239, 78%, 66%, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
}

// ─── Password Toggle ─────────────────────────────
function togglePassword() {
    const input = document.getElementById('password');
    const btn = document.querySelector('.password-toggle');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

// ─── Login Form ──────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loginBtn = document.getElementById('loginBtn');
        const alertBox = document.getElementById('alertBox');
        alertBox.innerHTML = '';
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        try {
            const res = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('adminName', data.admin.name);
                window.location.href = '/admin/dashboard.html';
            } else {
                alertBox.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
            }
        } catch (err) {
            alertBox.innerHTML = `<div class="alert alert-error">❌ Server error. Please try again.</div>`;
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In →';
        }
    });
}

// ─── Auth Helpers ────────────────────────────────
function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    window.location.href = '/admin/login.html';
}

// ─── Toast Notification ──────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300)">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// ─── Init ────────────────────────────────────────
initLoginCanvas();
