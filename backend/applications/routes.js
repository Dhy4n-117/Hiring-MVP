const express = require('express');
const router = express.Router();
const Application = require('./Application');
const Job = require('../jobs/Job');
const upload = require('../middleware/upload');
const nodemailer = require('nodemailer');

// POST /applications/apply — submit a new application (public)
router.post('/apply', upload.single('resume'), async (req, res, next) => {
    try {
        const { jobId, name, email, phone, coverLetter, portfolioLinks } = req.body;

        // Validate job exists
        const job = await Job.findById(jobId);
        if (!job || !job.isActive) {
            return res.status(404).json({ message: 'Job not found or no longer active' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Resume file is required' });
        }

        const application = await Application.create({
            jobId,
            name,
            email,
            phone,
            resumeUrl: `/uploads/${req.file.filename}`,
            coverLetter: coverLetter || '',
            portfolioLinks: portfolioLinks || ''
        });

        // Send confirmation email (non-blocking)
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Application Received – ${job.title}`,
                html: `
                    <h2>Thank you for applying, ${name}!</h2>
                    <p>We have received your application for <strong>${job.title}</strong>.</p>
                    <p>Our team will review your application and get back to you soon.</p>
                    <br>
                    <p>Best regards,<br>Hiring Team</p>
                `
            });
        } catch (emailErr) {
            console.log('⚠️ Email sending failed (non-critical):', emailErr.message);
        }

        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
