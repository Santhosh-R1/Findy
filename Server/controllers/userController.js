const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto')
const { getPasswordResetHTML } = require('../utils/emailTemplates');
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        address,
        gender,
        password
    } = req.body;

    try {
        if (!firstName || !lastName || !email || !password || !phone || !address || !gender) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        const userPhone = await User.findOne({ phone });

        if (userPhone) {
            return res.status(400).json({ message: 'User with this Phone Number already exists.' });
        }
        let profileImagePath = null;
        if (req.file) {
            profileImagePath = '/' + req.file.path.replace(/\\/g, "/");
        }
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            address,
            gender,
            password,
            profileImage: profileImagePath,
        });
        const newUser = await user.save();

        if (newUser) {
            res.status(201).json({
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                profileImage: newUser.profileImage,
                token: generateToken(newUser._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            res.status(200).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'Email address not found in our database.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const appName = "Findy";
        const frontendURL = `http://localhost:5173/reset-password/${resetToken}`;

        const htmlContent = getPasswordResetHTML(user.firstName, frontendURL, appName);
        const plainTextMessage = `Hi ${user.firstName},\n\nPlease use the following link to reset your password (link is valid for 10 minutes):\n${frontendURL}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe ${appName} Team`;

        await sendEmail({
            email: user.email,
            subject: `[${appName}] Your Password Reset Link`,
            message: plainTextMessage, 
            html: htmlContent,        
        });

        res.status(200).json({
            message: 'If an account with that email exists, a token has been sent.',
        });

    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);
        if (user) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
    }
};
const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }
        if (req.body.password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save(); 

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            message: "Password reset successful.",
            token,
        });

    } catch (error) {
        console.error('RESET PASSWORD ERROR:', error);
        res.status(500).json({ message: 'Error resetting password. Please try again.' });
    }
};
module.exports = {
    registerUser,
    loginUser,
    resetPassword,
    forgotPassword
};