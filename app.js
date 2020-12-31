if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsmate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const campgrounds=require('./routes/campground')
const reviews=require('./routes/review')
const session=require('express-session')
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user')
const  userRoutes=require('./routes/users')
const mongoSanitize=require('express-mongo-sanitize')
const app = express();
const helmet = require('helmet');


const MongoDBStore=require('connect-mongo')(session);

const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//mongodb://localhost:27017/yelp-camp
mongoose.connect(dbUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify:false,
    
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database connected!");
});
app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(mongoSanitize({
    replaceWith:'_'
}));


const scriptSrcUrls=[
    "https://cdn.jsdelivr.net/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudfare.com/",
    "https://cdn.jsdelivr.com/",
];
const styleSrcUrls=[
    "https://cdn.jsdelivr.net/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit-free.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    
];
const connectSrcUrls=[
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://events.mapbox.com/",
    
];
const fontSrcUrls=[];
app.use(helmet.contentSecurityPolicy({
    directives:{
        defaultSrc:[],
        connectSrc:["'self'",...connectSrcUrls],
        scriptSrc:["'unsafe-inline'","'self'",...scriptSrcUrls],
        styleSrc:["'unsafe-inline'","'self'",...styleSrcUrls],
        workerSrc:["'self'","blob:"],
        objectSrc:[],
        imgSrc:[
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dlrspb4xq/",
            "https://images.unsplash.com/",
        ],
        fontSrc:["'self'",...fontSrcUrls],
    },
})
);
const secret=process.env.SECRET ||'Secret';
app.use(methodOverride('_method'));
app.use(express.static('public'));
const store=new MongoDBStore({
    url:dbUrl,
    secret,
    touchAfter:24*60*60
});
store.on('error',function(e){
    console.log('Session Store Error',e)
})
const sessionConfig={
   store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
           expires:Date.now()+1000*60*60*24*7,
           maxAge:1000*60*60*24*7
       }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
   next();
})
app.use(express.urlencoded({ extended: true }));

app.use('/campgrounds',campgrounds)
app.use('/campgrounds/:id/reviews',reviews)
app.use('/',userRoutes)
app.get('/', (req, res) => {
    res.render("home.ejs");
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404));
})
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    res.status(status).render('error', { err });
})
app.listen(3000, () => {
    console.log("Listening at Port:3000");
})