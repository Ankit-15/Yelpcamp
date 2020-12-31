const express = require('express');
const app = express();
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport=require('passport');
const user=require('../controllers/users')
const campgrounds = require('../routes/campground')

router.route('/register')
    .get(user.renderRegistrationForm)
    .post( catchAsync(user.register))

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),user.login)

router.get('/logout',user.logout)

module.exports = router;