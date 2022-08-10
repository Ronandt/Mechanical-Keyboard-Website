//Library Imports
const express = require('express');
const flash = require('connect-flash');
const path = require('path');
const session = require('express-session');
const handlebars = require('handlebars');
const moment = require('moment');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const {
    allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');
const passport = require('passport');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const showdown = require('showdown');

//Local Imports
const initaliseDatabase = require('./models/initalise_database');
const initalisePassportLocal = require('./authentication/passport_local');
const initalisePassportAnonymous = require('./authentication/passport_anonymous');
const InitaliseGoogleLogin = require('./authentication/passport_google');
const customerRouter = require('./routes/customer');
const staffRouter = require('./routes/staff');
const loginRouter = require('./routes/login');
const chatbotRouter = require('./routes/Chatbot');

// const voucherRouter = require("./routes/voucher");

const FAQrouter = require('./routes/staff_FAQs');
const { sum } = require('./models/product');
const { OrderItem } = require('./models/order');

//Initialisation of the app
const app = express();

//Setup

app.use(
    session({
        secret: 'keyhub',
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

app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && 'method' in req.body) {
            // look in urlencoded POST bodies and delete it
            const method = req.body.method;
            delete req.body.method;
            return method;
        }
    })
);

app.use(flash());
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, '../views'));

app.engine(
    'handlebars',
    engine({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        defaultLayout: 'page-layout',
        helpers: {
            equals(arg1, arg2, options) {
                return arg1 == arg2 ? options.fn(this) : options.inverse(this);
            },

            notequals(arg1, arg2, options) {
                return !(arg1 == arg2)
                    ? options.fn(this)
                    : options.inverse(this);
            },

            dateFormat(date, option) {
                return moment(date).format(option);
            },

            mdToHtml(string) {
                var converter = new showdown.Converter();
                return converter.makeHtml(string);
            },
            truncate(string, maxlen) {
                maxlen = parseInt(maxlen);
                if (string.length > maxlen) {
                    string = string.substr(0, maxlen) + '...';
                }
                return string;
            },
            multiply(a, b) {
                if (typeof a === 'number' && typeof b === 'number') {
                    return a * b;
                }
            },
            sum_quantity(array) {
                s = 0;
                for (i = 0; i < array.length; i++) {
                    s += array[i].quantity;
                }
                return s;
            },

            quillDeltaToHtml(delta) {
                var QuillDeltaToHtmlConverter =
                    require('quill-delta-to-html').QuillDeltaToHtmlConverter;

                var deltaOps = JSON.parse(delta).ops;
                var cfg = {};

                var converter = new QuillDeltaToHtmlConverter(deltaOps, cfg);

                var html = converter.convert();
                return html;
            },
        },
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
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.success = req.flash('success');
    res.locals.authenticated = req.isAuthenticated();
    res.locals.user = req.user;
    res.locals.method = req.body.method;
    res.locals.image =
        'data:image/png;base64, ' +
        require('fs').readFileSync(
            `public/${req.user?.imageFilePath ?? 'uploads/unknownimage.png'}`,
            'base64'
        );
    next();
});

app.use((req, res, next) => {
    if (req.isAuthenticated() && req.user.disabled == 1) {
        req.logOut();
    }
    next();
});

//Routers
app.use('/staff', staffRouter);
app.use('/', loginRouter);
app.use('/', customerRouter);
app.use('/chatbot', chatbotRouter);

//Export to app.js
module.exports = app;
