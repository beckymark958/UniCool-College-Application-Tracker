const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');

const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

// Setup mongodb
mongoose.connect('mongodb://localhost:27017/yelp-camp', {       
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

const app = express();

// Setup views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup Method-Override
app.use(methodOverride('_method'));

// Setup Ejs-mate
app.engine('ejs', ejsMate);

// is a method(bodyParser) inbuilt in express to recognize the incoming Request Object as strings or arrays.
app.use(express.urlencoded({extended: true}))  // extended: true if nested content is allowed

app.use(express.static(path.join(__dirname, 'public')))

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home.ejs');
})


app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404));
})

app.use((err, req, res, next) => {
    const{statusCode = 500} = err;
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error.ejs', { err });
})

app.listen(8080, () => {
    console.log("Serving on Port 8080");
})