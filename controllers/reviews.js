const Campground = require('../models/campground');
const Review=require('../models/review');

module.exports.postReview=async (req,res)=>{
    const review=req.body.review;
    const rev=new Review(review);
    const campground=await Campground.findById(req.params.id);

    rev.author=req.user._id;
    campground.reviews.push(rev);
    await rev.save();
    await campground.save();
    req.flash('success','Posted a Review');

    res.redirect(`/campgrounds/${campground.id}`);
    
    }
    module.exports.deleteReview=async (req,res)=>{
        const {id, reviewId}=req.params;
        const campground=await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted Review');

        res.redirect(`/campgrounds/${campground._id}`);
        
        }