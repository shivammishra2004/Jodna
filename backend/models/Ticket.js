const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Open', 'InProgress', 'Review', 'Done'],
        default: 'Open',
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The Designer
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The Manager/Admin
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

// Update updated_at on save
ticketSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
