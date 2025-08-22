const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name.'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters.']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address.'],
    trim: true,
    lowercase: true,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject.'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters.']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message.'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;