const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

// Setup mongodb
mongoose.connect('mongodb://localhost:27017/yelp-camp', {       
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});


// Setup views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup Method-Override
app.use(methodOverride('_method'));

// Setup Ejs-mate
app.engine('ejs', ejsMate);

// is a method(bodyParser) inbuilt in express to recognize the incoming Request Object as strings or arrays.
app.use(express.urlencoded({extended: true}))  // extended: true if nested content is allowed

app.get('/', (req, res) => {
    res.render('home.ejs');
})

// View all campground (index)
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {campgrounds})
})

// Create new campground
// (Notice: the order matters! If it places behind the next one, it will treat 'new' as the 'id')
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs');
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

// Show campground page
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show.ejs', {campground});
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit.ejs', {campground});
})

app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


app.listen(8080, () => {
    console.log("Serving on Port 8080");
})