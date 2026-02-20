require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./auth/routes');
const jobRoutes = require('./jobs/routes');
const applicationRoutes = require('./applications/routes');
const adminRoutes = require('./admin/routes');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);

// Error handler
app.use(errorHandler);

// Connect DB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📂 Frontend: http://localhost:${PORT}`);
        console.log(`📂 Admin Panel: http://localhost:${PORT}/admin/login.html`);
    });
});
