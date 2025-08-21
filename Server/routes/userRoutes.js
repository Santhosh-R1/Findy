const express = require('express');
const router = express.Router();
const UserConroller = require('../controllers/userController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

router.post('/register', uploadMiddleware.uploadProfileImage, UserConroller.registerUser);
router.post('/login', UserConroller.loginUser);
router.post('/forgot-password', UserConroller.forgotPassword);
router.post('/reset-password/:token', UserConroller.resetPassword);
module.exports = router;