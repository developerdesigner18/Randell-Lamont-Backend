const express = require('express');
const UserController = require('../controller/user.js');
const {uploadImage} = require('../middleware/upload.js')
const passport = require('passport') ;
require('../middleware/passport.js')(passport) 

const router = express.Router();

// User signup endpoint
router.post('/signUp', uploadImage.single('image'), UserController.signUp);
router.post('/sendOtp', UserController.sendOtp);
router.post('/verifyOtp', UserController.verifyOtp);
router.post('/signIn', UserController.signIn);
router.post('/verifyOtpLogin', UserController.verifyOtpAtLogin);
router.get('/getUserData', (passport.authenticate('jwt', { session: false})), UserController.getUserData);

module.exports = router;
