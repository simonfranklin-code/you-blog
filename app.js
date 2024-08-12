
require('dotenv').config();
var debug = require('debug')('my express app');
var express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const lessMiddleware = require('less-middleware');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session); // Ensure you have connect-sqlite3 installed
const { body, validationResult } = require('express-validator');
const blogPostRoutes = require('./routes/blogPostRoutes');
const commentRoutes = require('./routes/commentRoutes');
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const likeRoutes = require('./routes/likeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reviewLikeRoutes = require('./routes/reviewLikeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const followerRoutes = require('./routes/followerRoutes');
var app = express();

// Passport config
require('./config/passport')(passport);
// Connect flash
app.use(flash());
// Express session
app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './database' }), // Use SQLite store for session persistence
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    
    next();
});
// Configure Less middleware
app.use(
    lessMiddleware(path.join(__dirname, 'public'), {
        dest: path.join(__dirname, 'public'),
        preprocess: {
            path: function (pathname, req) {
                return pathname.replace('/stylesheets/', '/less/');
            },
        },
        force: true,
        debug: true,
    })
);
// Enable files upload
app.use(fileUpload({
    createParentPath: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/blog-post/:slug', blogPostRoutes);
app.use('/comments', commentRoutes);
// Mounting the userRoutes
app.use('/users', userRoutes);
app.use('/', indexRoutes);
// Mounting the adminRoutes
app.use('/admin', adminRoutes);
app.use('/likes', likeRoutes);
app.use('/reviews', reviewRoutes);
app.use('/reviewLikes', reviewLikeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/followers', followerRoutes);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', 10000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
