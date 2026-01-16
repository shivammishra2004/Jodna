const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
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
    ref: 'User',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
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

// Add new fields for Todos and Attachments
ticketSchema.add({
  todos: [{
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }],
  attachments: [{
    filename: String,
    contentType: String,
    data: Buffer,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }]
});

ticketSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
