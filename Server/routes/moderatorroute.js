const express = require('express');
const router = express.Router();
const moderatorController = require('../controllers/ModeratorController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

router.post('/login', moderatorController.loginModerator);
router.post('/forgot-password', moderatorController.forgotModeratorPassword);
router.patch('/reset-password/:token', moderatorController.resetModeratorPassword);
router.post('/register',uploadMiddleware.uploadProfileImage,moderatorController.addModerator);
router.get('/', moderatorController.getAllModerators);
router.patch('/:id/activate',moderatorController.activateModerator);

router.patch('/:id/deactivate', moderatorController.deactivateModerator);


module.exports = router;