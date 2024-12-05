
require('dotenv').config();
var debug = require('debug')('you blog express app');
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
const chatRoutes = require('./routes/chatRoutes');
const friendRoutes = require('./routes/friendRoutes');
const timelineRoutes = require('./routes/timelineRoutes')
const http = require('http');
const socketIo = require('socket.io');
const passportSocketIo = require('passport.socketio');
const userWithAvatar = require('./models/User');
var app = express();

// Passport config
require('./config/passport')(passport);
// Connect flash
app.use(flash());
// Create HTTP server and wrap Express app
const server = http.createServer(app);

// Set up Socket.IO
const io = socketIo(server);

// Set up the session store
const sessionStore = new SQLiteStore({ db: 'sessions.db', dir: './database' });
// Express session middleware
const sessionMiddleware = session({
    store: sessionStore, // Use SQLite store for session persistence
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
});

// Use session middleware in Express
app.use(sessionMiddleware);


// Express session
app.use(session({
    store: sessionStore, // Use SQLite store for session persistence
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Use Passport with Socket.IO
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,       // Same cookie parser middleware
    key: 'connect.sid',               // Name of the cookie used in Express sessions
    secret: 'secret',                 // Session secret
    store: sessionStore,              // Session store (e.g., SQLiteStore)
    success: onAuthorizeSuccess,      // Callback on success
    fail: onAuthorizeFail             // Callback on failure
}));

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept(); // Allow connection
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) {
        accept(new Error(message)); // Deny connection
    }
}


// Store online users
const onlineUsers = new Set();

// Handle Socket.IO connections
io.on('connection', (socket) => {
    const user = socket.request.user; // Access authenticated user

    if (user && user.id) {
        console.log(`User connected: ${user.username} (${user.id})`);

        // Add user to online users set
        onlineUsers.add(user.id);

        // Notify all clients that the user is online
        io.emit('user-online', { userId: user.id, username: user.username, avatar: user.avatar });

        // Join user-specific room
        socket.join(user.id);  // Use the user's ID to join a room

        // Handle receiving a chat message from the client
        socket.on('chatMessage', (msg) => {
            if (user) {
                io.emit('chatMessage', { avatar: user.avatar, username: user.username, message: msg });
            }
        });

        // Listen for private messages
        socket.on('privateMessage', async (data) => {
            const targetUserId = data.to;  // Target user's ID
            const message = data.message;  // The message to be sent
            const uwa = await userWithAvatar.getUserWithAvatar(targetUserId);
            io.to(targetUserId).emit('privateMessage', {
                from: user.username,  // Send the username of the sender
                message: message,
                userWithAvatar: uwa
            });
        });

        // Handle user disconnecting
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.username} (${user.id})`);

            // Remove user from online users set
            onlineUsers.delete(user.id);

            // Notify all clients that the user has gone offline
            io.emit('user-offline', { userId: user.id, username: user.username, avatar: user.avatar });
        });
    }
});



// Global variables for flash messages and user
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Enable files upload
app.use(fileUpload({
    createParentPath: true
}));

// Make io accessible via req.io in all routes and controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.set('trust proxy', 1); // Trust first proxy

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Set the 'basedir' option for Pug to resolve absolute paths in includes
app.locals.basedir = path.join(__dirname, 'views');
// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.use('/blog/:blogSlug/:slug', blogPostRoutes);
app.use('/comments', commentRoutes);
app.use('/users', userRoutes);
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/likes', likeRoutes);
app.use('/reviews', reviewRoutes);
app.use('/reviewLikes', reviewLikeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/followers', followerRoutes);
app.use('/chat', chatRoutes);
app.use('/friends', friendRoutes);
app.use('/users/timeline', timelineRoutes);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Set the port and start the server
app.set('port', process.env.PORT || 10000);

server.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
