const express=require("express");
const router=express.Router({mergeParams: true});  /*merge params sends parametr of parent routes that can be used in child */
const wrapAsync=require("../utils/wrapasync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing= require('../models/listing.js');
const {validateReview ,isLoggedIn,isReviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");


// review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

// detete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;