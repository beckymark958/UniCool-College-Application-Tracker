const mongoose = require('mongoose');
const cities = require('./cities.js');
const {places, descriptors} = require('./seedHelpers.js')
const Campground = require('../models/campground.js');

// setup mongodb
mongoose.connect('mongodb://localhost:27017/yelp-camp', {       
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});


// generate random campgrounds data (location and title)
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground ({
            author: '62c5d0611c2f565f58996458',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "test text over here. Camping is wonderful. Yay!",
            price:price,
            geometry: { 
                type: "Point",
                coordinates: [ -122.330062, 47.603832 ] 
            },
            images: [
                {
                    url:'https://res.cloudinary.com/beckyyu/image/upload/v1657737724/YelpCamp/dxdsocmlpc6vkubcky8n.jpg',
                    filename:'YelpCamp/dxdsocmlpc6vkubcky8n'
                },
                {
                    url:'https://res.cloudinary.com/beckyyu/image/upload/v1657737724/YelpCamp/ze6zfcskdeeocsi28hxp.jpg',
                    filename:'YelpCamp/ze6zfcskdeeocsi28hxp'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then( () => {
    mongoose.connection.close();
})