'use strict';
var debug = require('debug')('my express app');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const blogPostRoutes = require('./routes/blogPostRoutes');
const blogPostCommentsRoutes = require('./routes/blogPostCommentsRoutes');
const blogPostCommentRepliesRoutes = require('./routes/blogPostCommentRepliesRoutes');
const addBlogPostCommentReplyRoutes = require('./routes/addBlogPostCommentReplyRoutes');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const userRoutes = require('./routes/userRoutes');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/blog-post/:slug', blogPostRoutes);
app.use('/comments/:slug', blogPostCommentsRoutes);
app.use('/addCommentReply', addBlogPostCommentReplyRoutes);
app.use('/replies/:slug/:commentId', blogPostCommentRepliesRoutes);
// Mounting the userRoutes
app.use('/users', userRoutes);
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

//app.post('/ajax', urlencodedParser, (req, res) => {
//    console.log(req.body); // Access posted data here
//    console.log('Request received');
//    const sqlite3 = require('sqlite3').verbose();
//    var db = new sqlite3.Database('C:\\Users\\Susana Rijo\\Source\\repos\\Smf\\YouBlog\\Server\\Digital-Marketing-Guru.db', (err) => {
//        if (err) {
//            console.error(err.message);
//            return;
//        }
//        const { Email, Author, DisplayName, Url, Text, DateCreated, DateModified, BlogPostSlug, ParentCommentId, IsOpen, BlogPostId } = req.body;
//        db.run("INSERT INTO Comments (Email, Author, DisplayName, Url, Text, DateCreated, DateModified, BlogPostSlug, ParentCommentId, IsOpen, BlogPostId ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [Email, Author, DisplayName, Url, Text, DateCreated, DateModified, BlogPostSlug, ParentCommentId, IsOpen, BlogPostId], (err) => {
//            if (err) {
//                console.error(err);
//                res.status(500).json({ error: "Error saving data" });
//            } else {
//                res.json({ message: "Reply saved successfully" });
//            }
//        });
//    });
//});

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

app.set('port', 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
