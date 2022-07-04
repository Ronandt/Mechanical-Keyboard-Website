//Library Imports
const express = require("express");
const flash = require("connect-flash");
const path = require("path");
const session = require("express-session");
const handlebars = require("handlebars");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const {
    allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const passport = require("passport");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");

//Local Imports
const initaliseDatabase = require("./models/initalise_database");
const initalisePassportLocal = require("./authentication/passport_local");
const initalisePassportAnonymous = require("./authentication/passport_anonymous");
const InitaliseGoogleLogin = require("./authentication/passport_google");
const customerRouter = require("./routes/customer");
const staffRouter = require("./routes/staff");
const loginRouter = require("./routes/login");

// const voucherRouter = require("./routes/voucher");


const FAQrouter = require("./routes/staff_FAQs");

//Initialisation of the app
const app = express();

//Setup

app.use(
    session({
        secret: "keyhub",
        rolling: true,
        cookie: {
            maxAge: 99999999,
        },
        saveUninitialized: true,
        resave: false,
    })
);

app.use(cookieParser());

app.use(passport.session());

app.use(express.static(path.join(__dirname, "../public")));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    session({
        secret: "keyhub",
        resave: false,
        saveUninitialized: true,
    })
);


app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === "object" && "method" in req.body) {
            // look in urlencoded POST bodies and delete it
            const method = req.body.method;
            delete req.body.method;
            return method;
        }
    })
);



app.use(flash());
app.set("view engine", "handlebars");

app.set("views", path.join(__dirname, "../views"));

// import helpers
const helpers = require('./helpers');

app.engine(
    "handlebars",
    engine({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        defaultLayout: "page-layout",
        helpers: helpers,
    })
);

//Initalisation of the database
initaliseDatabase();

//Initalisation of the passport authentication systems
initalisePassportLocal();
initalisePassportAnonymous();
InitaliseGoogleLogin();

//Global variables (middleware)
app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");
    res.locals.success = req.flash("success");
    res.locals.authenticated = req.isAuthenticated();
    res.locals.user = req.user;
    res.locals.method = req.body.method;
    next();
});

app.use((req, res, next) => {
    if(req.isAuthenticated() && req.user.disabled == 1) {
        req.logOut()
    }
    next()
})

//Routers
app.use("/staff", staffRouter);
app.use("/", loginRouter);
app.use("/", customerRouter);



//Export to app.js
module.exports = app;
