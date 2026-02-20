const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: [true, 'Application ID is required']
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },
    meetingLink: {
        type: String,
        required: [true, 'Meeting link is required'],
        trim: true
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
