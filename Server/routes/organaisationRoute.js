const express = require('express');
const router = express.Router();
const Organaisation = require('../controllers/OrganaizationController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

router.post('/register', uploadMiddleware.uploadOrganisationLogo, Organaisation.registerOrganisation);
router.post('/login', Organaisation.loginOrganisation);
router.post('/forgot-password', Organaisation.forgotPassword);
router.post('/reset-password/:token', Organaisation.resetPassword);
module.exports = router;