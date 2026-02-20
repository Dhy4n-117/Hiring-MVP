const express = require('express');
const router = express.Router();
const Interview = require('./Interview');
const Application = require('../applications/Application');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/auth');

// All interview routes require admin auth
router.use(authMiddleware);

// POST /admin/interview/schedule
router.post('/schedule', async (req, res, next) => {
    try {
        const { applicationId, scheduledDate, meetingLink, notes } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const interview = await Interview.create({
            applicationId,
            scheduledDate,
            meetingLink,
            notes: notes || ''
        });

        // Update application status
        application.status = 'Interview Scheduled';
        await application.save();

        // Send interview notification email (non-blocking)
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
                to: application.email,
                subject: 'Interview Scheduled – Hiring Team',
                html: `
                    <h2>Interview Scheduled</h2>
                    <p>Dear ${application.name},</p>
                    <p>Your interview has been scheduled.</p>
                    <p><strong>Date:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
                    <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
                    ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                    <br>
                    <p>Best regards,<br>Hiring Team</p>
                `
            });
        } catch (emailErr) {
            console.log('⚠️ Email sending failed (non-critical):', emailErr.message);
        }

        res.status(201).json({
            message: 'Interview scheduled successfully',
            interview
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
