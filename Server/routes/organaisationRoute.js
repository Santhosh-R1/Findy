const express = require('express');
const router = express.Router();
// Corrected the controller variable name for consistency, assuming the file is OrganaizationController.js
const organisationController = require('../controllers/OrganaizationController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

// --- PUBLIC ROUTES ---
// For organisations to register, log in, and manage their own passwords
router.post('/register', uploadMiddleware.uploadOrganisationLogo, organisationController.registerOrganisation);
router.post('/login', organisationController.loginOrganisation);
router.post('/forgot-password', organisationController.forgotPassword);
// Changed to PATCH as it's an update operation
router.patch('/reset-password/:token', organisationController.resetPassword);


// --- NEW MANAGEMENT ROUTES (UNPROTECTED) ---
// As requested, these routes for managing organisations are accessible without authentication.

// GET all organisations
router.get('/', organisationController.getAllOrganisations);
router.patch('/:id/activate', organisationController.activateOrganisation);
router.patch('/:id/deactivate', organisationController.deactivateOrganisation);


module.exports = router;