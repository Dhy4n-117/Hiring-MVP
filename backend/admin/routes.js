const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Job = require('../jobs/Job');
const Application = require('../applications/Application');
const Interview = require('../interviews/Interview');

// All admin routes require authentication
router.use(authMiddleware);

// ─── Job Management ────────────────────────────────

// POST /admin/job/create
router.post('/job/create', async (req, res, next) => {
    try {
        const { title, department, location, description, requirements, employmentType } = req.body;
        const job = await Job.create({ title, department, location, description, requirements, employmentType });
        res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
        next(error);
    }
});

// PUT /admin/job/update/:id
router.put('/job/update/:id', async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job updated successfully', job });
    } catch (error) {
        next(error);
    }
});

// DELETE /admin/job/delete/:id
router.delete('/job/delete/:id', async (req, res, next) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// ─── Application Management ────────────────────────

// GET /admin/applications
router.get('/applications', async (req, res, next) => {
    try {
        const filter = {};

        if (req.query.jobId) {
            filter.jobId = req.query.jobId;
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const applications = await Application.find(filter)
            .populate('jobId', 'title department location')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        next(error);
    }
});

// PUT /admin/application/status/:id
router.put('/application/status/:id', async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interviewed', 'Offer Sent', 'Hired', 'Rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('jobId', 'title department location');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ message: 'Status updated successfully', application });
    } catch (error) {
        next(error);
    }
});

// ─── Interview Management ──────────────────────────

// POST /admin/interview/schedule
router.post('/interview/schedule', async (req, res, next) => {
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

        res.status(201).json({ message: 'Interview scheduled successfully', interview });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
