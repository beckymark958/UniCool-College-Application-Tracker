// Require packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Acquire models
const User = require('./models/user.js');

// Require routes files
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

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

// setup Session Configuration
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))

// setup flash
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// setup passport
app.use(passport.initialize());
app.use(passport.session());      // need to be set after app.use(session())
passport.use(new LocalStrategy(User.authenticate()));  // specify authentication method

passport.serializeUser(User.serializeUser())          //  how do we store user in the session
passport.deserializeUser(User.deserializeUser())      //  how do we unstore user in the session



app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

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