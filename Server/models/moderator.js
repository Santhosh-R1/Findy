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
        type: String 
    },

    password: { 
        type: String, 
        required: [true, 'Password is required.'], 
        minlength: 6,
        select: false 
    },
    role: {
        type: String,
        default: 'moderator' 
    },
    isActive: {
        type: Boolean,
        default: true 
    },
    
    passwordResetToken: String,
    passwordResetExpires: Date,

}, { timestamps: true }); 

moderatorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

moderatorSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

moderatorSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
    
    return resetToken; 
};


const Moderator = mongoose.model('Moderator', moderatorSchema);
module.exports = Moderator;