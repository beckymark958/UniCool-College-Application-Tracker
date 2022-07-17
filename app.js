// Require env packages when we are in development mode, not production mode
if (process.nev_NODE_ENV !== "production") {
  require('dotenv').config();
}

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
const mongoSanitize = require('express-mongo-sanitize');   // Sanitizes inputs against query selector injection attacks
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');


// Acquire models
const User = require('./models/user.js');

// Require routes files
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// Setup mongodb
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {       
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

app.use(mongoSanitize())

// Setup Mongo DB Atlas
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,    // in seconds
    crypto: {
        secret: 'squirrel'
    }
})
store.on("error", function(e) {
    console.log("Session store error", e)
})

// setup Session Configuration
const sessionConfig = {
    store,
    name: 'session',                     // name of the cookie
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,            // cookies are only accessible in HTTP
    //   secure: true,              // can only access with HTTPs
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,     // in milliseconds
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

// setup helmet

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/beckyyu/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/beckyyu/"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/beckyyu/"
];
const fontSrcUrls = ["https://res.cloudinary.com/beckyyu/"];

app.use(
    helmet({
        contentSecurityPolicy: {
            directives : {
                defaultSrc : [],
                connectSrc : [ "'self'", ...connectSrcUrls ],
                scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
                styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
                workerSrc  : [ "'self'", "blob:" ],
                objectSrc  : [],
                imgSrc     : [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/beckyyu/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/"
                ],
                fontSrc    : [ "'self'", ...fontSrcUrls ],
                mediaSrc   : [ "https://res.cloudinary.com/dlzez5yga/" ],
                childSrc   : [ "blob:" ],
                'script-src-attr': null
            }
        },
        crossOriginEmbedderPolicy: false
    })
);

// setup passport
app.use(passport.initialize());
app.use(passport.session());      // need to be set after app.use(session())
passport.use(new LocalStrategy(User.authenticate()));  // specify authentication method

passport.serializeUser(User.serializeUser())          //  how do we store user in the session
passport.deserializeUser(User.deserializeUser())      //  how do we unstore user in the session

// setup flash
app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


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

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Serving on Port 8080");
})