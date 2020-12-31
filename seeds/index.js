
const mongoose=require('mongoose');
const cities=require('./cities');
const {places, descriptors}=require('./seedhelpers');

const Campground=require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useUnifiedTopology:true,
    useNewUrlParser:true,
    useCreateIndex:true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected!");
});

const sample=(array)=>{
    return array[Math.floor(Math.random()*array.length)];
}


const seedDB=async ()=>{
await Campground.deleteMany({});
for(let i=0;i<200;i++){
const rand=Math.floor(Math.random()*1000);
const price=()=>Math.floor(Math.random()*20)+10;
const camp=new Campground({
    author:'5fe9ce398bad243f608bdb5e',
        title:`${sample(descriptors)} ${sample(places)}`,
        location:`${cities[rand].city},${cities[rand].state}`, 
        description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio aliquid minus quas a tenetur nulla error hic quae velit fugit ratione consequuntur esse at, quo totam praesentium eligendi adipisci maxime?',
        price:price(),
        geometry:{
            type:"Point",
            coordinates:[cities[rand].longitude,cities[rand].latitude]
        },
        images:[
          {
            url: 'https://res.cloudinary.com/dlrspb4xq/image/upload/v1609360567/YelpCamp/thzqgldewi6wo2fbaxvf.jpg',
            filename: 'YelpCamp/thzqgldewi6wo2fbaxvf'
          },
          {
            url: 'https://res.cloudinary.com/dlrspb4xq/image/upload/v1609360567/YelpCamp/ajin3xkuwg9inl8hpsr0.jpg',
            filename: 'YelpCamp/ajin3xkuwg9inl8hpsr0'
          }
        
          
        ]
});
await camp.save();
}
}

seedDB().then(()=>mongoose.connection.close());