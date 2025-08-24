const express = require('express');
const router = express.Router();
const UserConroller = require('../controllers/userController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

router.post('/register', uploadMiddleware.uploadProfileImage, UserConroller.registerUser);
router.post('/login', UserConroller.loginUser);
router.post('/forgot-password', UserConroller.forgotPassword);
router.post('/reset-password/:token', UserConroller.resetPassword);
router.get('/', UserConroller.getAllUsers);
router.get('/:userId', UserConroller.getUserProfile);
router.put('/profile/:userId', uploadMiddleware.uploadProfileImage, UserConroller.updateUserProfile);
module.exports = router;