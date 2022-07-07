/* 
|| Import || 
import packages, utils, models, middlewares, controllers
*/
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground.js');

// import middleware
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// import controllers
const campgrounds = require('../controllers/campgrounds.js')

/* 
|| Functions || 
Create, Update, Revise and Delete campgrounds
*/

// View all campgrounds (index)
router.get('/', catchAsync(campgrounds.index));

// Create new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm); // Noted: the order matters! If it places behind the next one, it will treat 'new' as the 'id'
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// Display single campground information
router.get('/:id', catchAsync(campgrounds.showCampground));

// Edit and Update campground
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// Delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;