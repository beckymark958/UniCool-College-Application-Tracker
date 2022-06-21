const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

// setup mongodb
mongoose.connect('mongodb://localhost:27017/yelp-camp', {       
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});


// setup views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({title: 'My Backgard', description: 'cheap camping!'});
    await camp.save()
    res.send(camp);
})

app.listen(3000, () => {
    console.log("Serving on Port 3000");
})