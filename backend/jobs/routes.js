const express = require('express');
const router = express.Router();
const Job = require('./Job');

// GET /jobs — list all active jobs (public, with optional filters)
router.get('/', async (req, res, next) => {
    try {
        const filter = { isActive: true };

        if (req.query.department) {
            filter.department = { $regex: req.query.department, $options: 'i' };
        }
        if (req.query.location) {
            filter.location = { $regex: req.query.location, $options: 'i' };
        }

        const jobs = await Job.find(filter).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        next(error);
    }
});

// GET /jobs/:id — single job detail (public)
router.get('/:id', async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
