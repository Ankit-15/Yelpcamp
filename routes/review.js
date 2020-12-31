const express=require('express');
const app=express();
const catchAsync = require('../utils/catchAsync');
const router=express.Router({mergeParams:true});
const {reviewSchema}=require('../schema');
const review = require('../controllers/reviews');
const Review=require('../models/review');
const ExpressError = require('../utils/ExpressError');

const isLoggedIn=(req,res,next)=>{

    if(!req.isAuthenticated() ){
        req.session.returnTo=req.originalUrl;
        req.flash('error','You must be LOGGED IN!');
        return res.redirect('/login');
    }

    next();
}
const isReviewAuthor=async (req,res,next)=>{
    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if(!review.author.equals(req.user._id)){
        req.flash('error','You donot have permission to do that!!')
        return res.redirect(`/campgrounds/${id}`);
    }next();
}
const validateReview=(req,res,next)=>{
   
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else
     next(); 

}
router.post('/',isLoggedIn,validateReview,catchAsync(review.postReview))
    
router.delete('/:reviewId',isReviewAuthor,catchAsync(review.deleteReview))
    module.exports=router;