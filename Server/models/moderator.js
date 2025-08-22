const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const moderatorSchema = new Schema({
    firstName: { 
        type: String, 
        required: [true, 'First name is required.'] 
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required.'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required.'], 
        unique: true,
        lowercase: true 
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required.'] 
    },

    aadhaarNumber: {
        type: String,
        required: [true, 'Aadhaar number is required.'],
        unique: true 
    },
    voterIdNumber: {
        type: String,
        required: [true, 'Voter ID is required.'],
        unique: true 
    },

    address: { 
        type: String, 
        required: [true, 'Address is required.'] 
    },
    gender: { 
        type: String, 
        required: true, 
        enum: ['male', 'female', 'other'] 
    },
    profileImage: { 
        type: String // This will store the path/URL to the image
    },

    // Security and Role
    password: { 
        type: String, 
        required: [true, 'Password is required.'], 
        minlength: 6,
        select: false // Prevents password from being sent back in queries by default
    },
    role: {
        type: String,
        default: 'moderator' // Automatically assign the 'moderator' role
    },
    isActive: {
        type: Boolean,
        default: true // Allows admin to enable/disable moderator accounts
    },
    
    // Password Reset Functionality (copied from userSchema)
    passwordResetToken: String,
    passwordResetExpires: Date,

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Middleware to hash password before saving (pre-save hook)
moderatorSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with a cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method to compare entered password with the hashed password in the DB
moderatorSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate a password reset token
moderatorSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token to expire in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
    
    return resetToken; // Return the unhashed token to be sent via email
};


const Moderator = mongoose.model('Moderator', moderatorSchema);
module.exports = Moderator;