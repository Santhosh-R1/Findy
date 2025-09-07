const Moderator = require('../models/moderator');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const { getPasswordResetHTML } = require('../utils/emailTemplates');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const addModerator = async (req, res) => {
    const {
        firstName, lastName, email, phone, aadhaarNumber,
        voterIdNumber, address, gender, password
    } = req.body;

    try {
        if (!firstName || !lastName || !email || !password || !phone || !aadhaarNumber || !voterIdNumber || !address || !gender) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }
        
        const moderatorExists = await Moderator.findOne({ email });
        if (moderatorExists) return res.status(400).json({ message: 'A moderator with this email already exists.' });
        
        const phoneExists = await Moderator.findOne({ phone });
        if (phoneExists) return res.status(400).json({ message: 'A moderator with this Phone Number already exists.' });
        
        const aadhaarExists = await Moderator.findOne({ aadhaarNumber });
        if (aadhaarExists) return res.status(400).json({ message: 'A moderator with this Aadhaar Number already exists.' });
        
        const voterIdExists = await Moderator.findOne({ voterIdNumber });
        if (voterIdExists) return res.status(400).json({ message: 'A moderator with this Voter ID already exists.' });

        let profileImagePath = null;
        if (req.file) {
            profileImagePath = '/' + req.file.path.replace(/\\/g, "/");
        }

        const moderator = new Moderator({
            firstName, lastName, email, phone, aadhaarNumber,
            voterIdNumber, address, gender, password,
            profileImage: profileImagePath,
        });

        const newModerator = await moderator.save();

        if (newModerator) {
            res.status(201).json({
                message: 'Moderator account created successfully!',
                data: {
                    _id: newModerator._id,
                    firstName: newModerator.firstName,
                    email: newModerator.email,
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid moderator data provided.' });
        }

    } catch (error) {
        console.error('Add Moderator Error:', error);
        res.status(500).json({ message: 'Server error while creating moderator.' });
    }
};

const loginModerator = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        const moderator = await Moderator.findOne({ email }).select('+password');

        if (moderator && (await moderator.comparePassword(password))) {
            if (!moderator.isActive) {
                return res.status(403).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
            }

            res.status(200).json({
                _id: moderator._id,
                firstName: moderator.firstName,
                email: moderator.email,
                role: moderator.role,
                profileImage: moderator.profileImage,
                token: generateToken(moderator._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

    } catch (error) {
        console.error('Moderator Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


const getAllModerators = async (req, res) => {
    try {
        const moderators = await Moderator.find({}).select('-password');
        res.status(200).json({
            count: moderators.length,
            data: moderators
        });
    } catch (error) {
        console.error('Get All Moderators Error:', error);
        res.status(500).json({ message: 'Server error while fetching moderators.' });
    }
};

const activateModerator = async (req, res) => {
    try {
        const moderator = await Moderator.findById(req.params.id);

        if (!moderator) {
            return res.status(404).json({ message: 'Moderator not found.' });
        }

        moderator.isActive = true;
        await moderator.save({ validateBeforeSave: false });

        res.status(200).json({ 
            message: `Moderator '${moderator.firstName} ${moderator.lastName}' has been activated.` 
        });

    } catch (error) {
        console.error('Activate Moderator Error:', error);
        res.status(500).json({ message: 'Server error while activating moderator.' });
    }
};

const deactivateModerator = async (req, res) => {
    try {
        const moderator = await Moderator.findById(req.params.id);

        if (!moderator) {
            return res.status(404).json({ message: 'Moderator not found.' });
        }

        moderator.isActive = false;
        await moderator.save({ validateBeforeSave: false });

        res.status(200).json({ 
            message: `Moderator '${moderator.firstName} ${moderator.lastName}' has been deactivated.` 
        });

    } catch (error) {
        console.error('Deactivate Moderator Error:', error);
        res.status(500).json({ message: 'Server error while deactivating moderator.' });
    }
};


const forgotModeratorPassword = async (req, res) => {
    let moderator;
    try {
        moderator = await Moderator.findOne({ email: req.body.email });
        if (!moderator) {
            return res.status(404).json({ message: 'Email address not found in our database.' });
        }

        const resetToken = moderator.createPasswordResetToken();
        await moderator.save({ validateBeforeSave: false });

        const appName = "Findy";
        const frontendURL = `http://localhost:5173/moderator/reset-password/${resetToken}`;
        const htmlContent = getPasswordResetHTML(moderator.firstName, frontendURL, appName);
        const plainTextMessage = `Hi ${moderator.firstName},\n\nPlease use the following link to reset your password (link is valid for 10 minutes):\n${frontendURL}`;

        await sendEmail.sendEmail({
            email: moderator.email,
            subject: `[${appName}] Moderator Password Reset Link`,
            message: plainTextMessage, 
            html: htmlContent,        
        });

        res.status(200).json({ message: 'If an account with that email exists, a token has been sent.' });

    } catch (error) {
        console.error('MODERATOR FORGOT PASSWORD ERROR:', error);
        if (moderator) {
            moderator.passwordResetToken = undefined;
            moderator.passwordResetExpires = undefined;
            await moderator.save({ validateBeforeSave: false });
        }
        res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
    }
};

const resetModeratorPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const moderator = await Moderator.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!moderator) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }
        
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }
        if (req.body.password.length < 8) { 
            return res.status(400).json({ message: "Password must be at least 8 characters long." });
        }

        moderator.password = req.body.password;
        moderator.passwordResetToken = undefined;
        moderator.passwordResetExpires = undefined;
        await moderator.save(); 

        const token = generateToken(moderator._id);
        res.status(200).json({ message: "Password reset successful.", token });

    } catch (error) {
        console.error('MODERATOR RESET PASSWORD ERROR:', error);
        res.status(500).json({ message: 'Error resetting password. Please try again.' });
    }
};

module.exports = {
    addModerator,
    loginModerator,
    getAllModerators, 
    activateModerator,  
    deactivateModerator,
    forgotModeratorPassword,
    resetModeratorPassword
};