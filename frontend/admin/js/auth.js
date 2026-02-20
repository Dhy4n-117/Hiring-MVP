const API_BASE = window.location.origin;

// Check if already logged in
if (localStorage.getItem('token') && !window.location.pathname.includes('login')) {
    // Already authenticated, stay on page
} else if (!localStorage.getItem('token') && !window.location.pathname.includes('login')) {
    window.location.href = '/admin/login.html';
}

// Login form handler
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
            loginBtn.textContent = 'Sign In';
        }
    });
}

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
