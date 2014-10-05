// Module dependencies.

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var amqp = require('amqp');
var util = require('util');

var routes = require('./routes/index');
var app = module.exports = express();

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.use('/', routes.index);

var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);
var redis = require('socket.io-redis');
io.adapter(redis({ host: '127.0.0.1', port: 6379 }));

io.sockets.on('connection', function(socket) {
  socket.on('message', function(data) {
    // socket.broadcast.emit('message', data);
    sendJobToQueue(rmqConn, {socketId: socket.id, msg: data})
  });
});

function randomId() {
  return Math.random().toString(36).substring(7).toUpperCase();
}

var connectRabbitMq = function (callback) {
  var logId = randomId();
  var rmqConn = amqp.createConnection({
    host: 'localhost',
    port: 5672,
    login: 'guest',
    password: 'guest'
  }, { reconnect: false });

  rmqConn.on('error', function (err) {
    logger.warn(util.format('[%s] RabbitMQ connection error: %s', logId, err));
  });

  rmqConn.on('ready', function () {
    rmqConn.queue('socket-io-worker', { autoDelete: false, durable: true });
    console.log(util.format('[%s] RabbitMQ connection ready', logId));
    callback(rmqConn);
  });
};

var sendJobToQueue = function(rmqConn, job) {
  rmqConn.publish('socket-io-worker', JSON.stringify(job), {deliveryMode: 2});
}

var rmqConn = null
connectRabbitMq(function(result) {
  rmqConn = result;
});
