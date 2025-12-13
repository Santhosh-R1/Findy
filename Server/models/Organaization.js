const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const organisationSchema = new Schema({
    organisationName: {
        type: String,
        required: [true, 'Organisation name is required'],
    },
    organisationType: {
        type: String,
        required: [true, 'Organisation type is required'],
        enum: ['cafe', 'retail', 'public', 'transport', 'police', 'corporate', 'other']
    },
    contactPerson: {
        type: String,
        required: [true, 'Contact person name is required'],
    },
    registrationId: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Organisation email is required'],
        unique: true,
        lowercase: true,
    },
    // --- ADDED PHONE FIELD ---
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    website: {
        type: String,
    },
    address: {
        type: String,
        required: [true, 'Organisation address is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    organisationLogo: {
        type: String,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,

}, {
    timestamps: true
});

organisationSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

organisationSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

organisationSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


const Organisation = mongoose.model('Organisation', organisationSchema);
module.exports = Organisation;