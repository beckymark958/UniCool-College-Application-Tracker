/* 
|| Import || 
import packages, routes, models, middlewares, controllers
*/

const express = require('express');
const catchAsync = require('../utils/catchAsync');
const router = express.Router({mergeParams: true});  // need access to campgrounds id

// import middlewares
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// import controllers
const reviews = require('../controllers/reviews');

/* 
|| Functions || 
Create, Update, Revise and Delete reviews
*/

// create a review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;