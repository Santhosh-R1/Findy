const Contact = require('../models/Contact');

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.submitContactForm = asyncHandler(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Please fill out all required fields.' 
    });
  }

  const newContactMessage = await Contact.create({
    name,
    email,
    subject,
    message,
  });

  res.status(201).json({
    status: 'success',
    message: 'Thank you for your message! We will get back to you soon.',
    data: {
      contact: newContactMessage,
    },
  });
});

exports.getAllContacts = asyncHandler(async (req, res, next) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: contacts.length,
    data: {
      contacts,
    },
  });
});

exports.getContactById = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
        status: 'fail',
        message: 'No contact message found with that ID.'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      contact,
    },
  });
});

exports.updateContactStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a status to update.'
    });
  }
  
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true, 
      runValidators: true, 
    }
  );

  if (!contact) {
    return res.status(404).json({
        status: 'fail',
        message: 'No contact message found with that ID.'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      contact,
    },
  });
});

exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return res.status(404).json({
        status: 'fail',
        message: 'No contact message found with that ID.'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});