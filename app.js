require('dotenv').load({silent: true});

if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var colors = require('colors');

var port = process.env.PORT || '3000';
var app = express();
var server = require('http').Server(app);

// var ChatServer_v05 = require('./servers/chat.v0.5');
var ChatServer_v06 = require('./servers/chat.v0.6');

server.listen(port, function () {
  console.log('Server listening at port %d'.green, port);
});

// app.use(require('./middlewares/cors'));

/* ------------------------------------------------------
  LOAD UP socket.io
------------------------------------------------------ */
var io = require('socket.io')(server);

var redis = require('redis').createClient;
var adapter = require('socket.io-redis');
var pub = redis(process.env.REDISCLOUD_URL, { key: 'activeplay' });
var sub = redis(process.env.REDISCLOUD_URL, { key: 'activeplay', return_buffers: true });

io.adapter(adapter({ pubClient: pub, subClient: sub }));

// new ChatServer_v05({ io: io, pub: pub }).init();
new ChatServer_v06({ io: io, pub: pub }).init();
// ------------------------------------------------------

var routes = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

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

module.exports = app;
