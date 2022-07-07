/* 
|| Import || 
import packages, routes, utils, controllers
*/
const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users.js');

/* 
|| Functions || 
*/

// Register
router.get('/register', users.renderRegister);
router.post('/register', catchAsync(users.register));

// Login
router.get('/login', users.renderLogin);
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), users.login)

// Logout
router.get('/logout', users.logout);

module.exports = router;