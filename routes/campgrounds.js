/* 
|| Import || 
import packages, utils, models, middlewares, controllers
*/
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground.js');
const multer = require('multer')

// import middleware
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// import controllers
const campgrounds = require('../controllers/campgrounds.js');

// apply multer to help storage our pictures
const { storage } = require('../cloudinary');  // it will automatically look for index file
const upload = multer({ storage });

/* 
|| Functions || 
Create, Update, Revise and Delete campgrounds
*/

router.route('/')
    .get(catchAsync(campgrounds.index)) // View all campgrounds (index)
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));   // 'image' is the name of the input field
    
router.get('/new', isLoggedIn, campgrounds.renderNewForm); // Noted: the order matters! If it places behind the next one, it will treat 'new' as the 'id'

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;