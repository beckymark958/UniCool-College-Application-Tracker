/* 
|| Import || 
import packages, routes, utils, controllers
*/
const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users.js');


// Register
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

// Login
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), users.login);

// Logout
router.get('/logout', users.logout);

module.exports = router;