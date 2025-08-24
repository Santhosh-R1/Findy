const express = require('express');
const router = express.Router();
const organisationController = require('../controllers/OrganaizationController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

router.post('/register', uploadMiddleware.uploadOrganisationLogo, organisationController.registerOrganisation);
router.post('/login', organisationController.loginOrganisation);
router.post('/forgot-password', organisationController.forgotPassword);
router.patch('/reset-password/:token', organisationController.resetPassword);
router.get('/', organisationController.getAllOrganisations);
router.patch('/:id/activate', organisationController.activateOrganisation);
router.patch('/:id/deactivate', organisationController.deactivateOrganisation);


module.exports = router;