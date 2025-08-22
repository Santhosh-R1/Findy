const Organisation = require('../models/Organaization'); 
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const { getPasswordResetHTML } = require('../utils/emailTemplates');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const registerOrganisation = async (req, res) => {
    const {
        organisationName,
        organisationType,
        contactPerson,
        registrationId,
        email,
        website,
        address,
        password,
    } = req.body;

    try {
        if (!organisationName || !organisationType || !contactPerson || !email || !address || !password) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }
        const organisationExists = await Organisation.findOne({ email }); 
        if (organisationExists) {
            return res.status(400).json({ message: 'Organisation with this email already exists.' });
        }
 const organisationIdExists = await Organisation.findOne({ registrationId }); 
        if (organisationIdExists) {
            return res.status(400).json({ message: 'Organisation with this Registration Id already exists.' });
        }
        let logoPath = null;
        if (req.file) {
            logoPath = '/' + req.file.path.replace(/\\/g, "/");
        }
        
        const organisation = new Organisation({
            organisationName,
            organisationType,
            contactPerson,
            registrationId, 
            email,
            website,        
            address,
            password,
            organisationLogo: logoPath,
        });
        const newOrganisation = await organisation.save();

        if (newOrganisation) {
            res.status(201).json({
                _id: newOrganisation._id,
                organisationName: newOrganisation.organisationName,
                email: newOrganisation.email,
                organisationLogo: newOrganisation.organisationLogo,
                token: generateToken(newOrganisation._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid organisation data.' });
        }

    } catch (error) {
        console.error('Organisation Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


const loginOrganisation = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }        const organisation = await Organisation.findOne({ email }).select('+password');
                if (organisation && (await organisation.comparePassword(password))) {
            res.status(200).json({
                _id: organisation._id,
                organisationName: organisation.organisationName,
                email: organisation.email,
                organisationLogo: organisation.organisationLogo,
                token: generateToken(organisation._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

    } catch (error) {
        console.error('Organisation Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const organisation = await Organisation.findOne({ email: req.body.email });
        if (!organisation) {
            return res.status(404).json({ message: 'Email address not found in our database.' });
        }

        const resetToken = organisation.createPasswordResetToken();
        await organisation.save({ validateBeforeSave: false });

        const appName = "Findy";
        const frontendURL = `http://localhost:5173/organisation/reset-password/${resetToken}`;

        const htmlContent = getPasswordResetHTML(organisation.contactPerson, frontendURL, appName);
        const plainTextMessage = `Hi ${organisation.contactPerson},\n\nPlease use the following link to reset your password (link is valid for 10 minutes):\n${frontendURL}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe ${appName} Team`;

        await sendEmail({
            email: organisation.email,
            subject: `[${appName}] Your Organisation Password Reset Link`,
            message: plainTextMessage,
            html: htmlContent,
        });

        res.status(200).json({
            message: 'If an account with that email exists, a token has been sent.',
        });

    } catch (error) {
        console.error('FORGOT PASSWORD ERROR (Org):', error);
        if (organisation) {
            organisation.passwordResetToken = undefined;
            organisation.passwordResetExpires = undefined;
            await organisation.save({ validateBeforeSave: false });
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

        const organisation = await Organisation.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!organisation) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }
        if (req.body.password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        organisation.password = req.body.password;
        organisation.passwordResetToken = undefined;
        organisation.passwordResetExpires = undefined;
        await organisation.save(); 

        const token = generateToken(organisation._id);

        res.status(200).json({
            message: "Password reset successful.",
            token,
        });

    } catch (error) {
        console.error('RESET PASSWORD ERROR (Org):', error);
        res.status(500).json({ message: 'Error resetting password. Please try again.' });
    }
};
const getAllOrganisations = async (req, res) => {
    try {
        const organisations = await Organisation.find({}).select('-password');
        res.status(200).json({
            count: organisations.length,
            data: organisations
        });
    } catch (error) {
        console.error('Get All Organisations Error:', error);
        res.status(500).json({ message: 'Server error while fetching organisations.' });
    }
};

/**
 * @desc    Activate an organisation's account (by Admin)
 * @route   PATCH /api/organisation/:id/activate
 * @access  Private/Admin
 */
const activateOrganisation = async (req, res) => {
    try {
        const organisation = await Organisation.findById(req.params.id);
        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found.' });
        }
        organisation.isActive = true;
        await organisation.save({ validateBeforeSave: false });
        res.status(200).json({ 
            message: `Organisation '${organisation.organisationName}' has been activated.` 
        });
    } catch (error) {
        console.error('Activate Organisation Error:', error);
        res.status(500).json({ message: 'Server error while activating organisation.' });
    }
};

/**
 * @desc    Deactivate an organisation's account (by Admin)
 * @route   PATCH /api/organisation/:id/deactivate
 * @access  Private/Admin
 */
const deactivateOrganisation = async (req, res) => {
    try {
        const organisation = await Organisation.findById(req.params.id);
        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found.' });
        }
        organisation.isActive = false;
        await organisation.save({ validateBeforeSave: false });
        res.status(200).json({ 
            message: `Organisation '${organisation.organisationName}' has been deactivated.` 
        });
    } catch (error) {
        console.error('Deactivate Organisation Error:', error);
        res.status(500).json({ message: 'Server error while deactivating organisation.' });
    }
};

module.exports = {
    registerOrganisation,
    loginOrganisation,
    forgotPassword,
    resetPassword,
    deactivateOrganisation,
    activateOrganisation,
    getAllOrganisations
};