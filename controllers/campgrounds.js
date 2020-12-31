const { cloudinary } = require('../cloudinary');
const Campground=require('../models/campground')
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken})



module.exports.index=async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}
module.exports.renderNewForm=(req, res) => {
     res.render('campgrounds/new');
}
module.exports.createcampground=async (req, res, next) => {
    // if(!req.body.campground)throw new ExpressError('Invalid Campground Data',400);
   const geoData=await geocoder.forwardGeocode({
       query:req.body.campground.location,
       limit:1
   }).send();
 
    const newcamp = new Campground(req.body.campground);
    newcamp.geometry=geoData.body.features[0].geometry;
    const img=req.files.map(f=>({url:f.path,filename:f.filename}));
    newcamp.images.push(...img);
    newcamp.author=req.user._id;
    await newcamp.save();
    console.log(newcamp)
    req.flash('success','Successfully made a Campground');
    res.redirect(`/campgrounds/${newcamp._id}`)
}
module.exports.showCampground=async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
    }}).populate('author');
    if(!campground){
        req.flash('error','Cannot find that Campground!')
    res.redirect('/campgrounds');
        
    }
    res.render('campgrounds/show', { campground });
}
module.exports.renderEditForm=async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}
module.exports.updateCampground=async (req, res) => {
    const { id } = req.params;
    const newcamp= await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true });
    const img=req.files.map(f=>({url:f.path,filename:f.filename}));
    console.log(img);
    newcamp.images.push(...img);
    await newcamp.save();
    if(req.body.deleteImages){
        for(let i of req.body.deleteImages){
             await cloudinary.uploader.destroy(i);
        }
        await newcamp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
         
    }
    req.flash('success','Successfully updated Campground');
    res.redirect(`/campgrounds/${id}`);
}
module.exports.deleteCampground=async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted Campground');

    res.redirect('/campgrounds');
}