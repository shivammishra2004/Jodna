const mongoose = require('mongoose');

// Attachment schema for review comments
const reviewAttachmentSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    data: Buffer,
    size: Number,
    uploadDate: { 
        type: Date, 
        default: Date.now 
    }
});

// Review Comment/Log schema - linear log like GitHub issues
const reviewCommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    // Attachments for this comment
    attachments: [reviewAttachmentSchema],
    // Optional: Track if this is a status change or regular comment
    isStatusChange: {
        type: Boolean,
        default: false
    },
    statusChange: {
        from: String,
        to: String
    }
});

// Main Review schema - represents the review workflow log for a ticket
const reviewSchema = new mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true,
        unique: true // One review log per ticket
    },
    // Linear log of comments/activities
    comments: [reviewCommentSchema],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

reviewSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Review', reviewSchema);
