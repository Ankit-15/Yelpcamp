

const express=require('express');
const app=express();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const joi=require('joi');
const router=express.Router();
const {campgroundSchema}=require('../schema');
const ExpressError = require('../utils/ExpressError');
const campgrounds=require('../controllers/campgrounds');
const multer  = require('multer');
const {storage}= require('../cloudinary');
const upload= multer({storage});
const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated() ){
        req.session.returnTo=req.originalUrl;
        req.flash('error','You must be LOGGED IN!');
        return res.redirect('/login');
    }

    next();
}

const validateCampground=(req,res,next)=>{
   
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else next();

}
const isAuthor=async (req,res,next)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You donot have permission to do that!!')
        return res.redirect(`/campgrounds/${id}`);
    }next();
}

router.route('/')
    .get( catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('campground[image]'),validateCampground, catchAsync(campgrounds.createcampground))
    // .post(upload.array('campground[image]'),(req,res)=>{
    //     console.log(req.body,req.files);
    //     res.send("It worked")
    // })
router.get('/new', isLoggedIn,campgrounds.renderNewForm)


router.route('/:id') 
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('campground[image]'),validateCampground, catchAsync(campgrounds.updateCampground))
    .delete( isAuthor,catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports=router;  