amqp = require 'amqp'
util = require 'util'
ioe = require 'socket.io-emitter'

emitter = ioe(host: '127.0.0.1', port: 6379)

logger =
	info: console.log
	error: console.log

rmqConn = amqp.createConnection(
	host: 'localhost'
	port: 5672
	login: 'guest'
	password: 'guest'
)

rmqConn.on 'ready', ->
	rmqConn.queue 'socket-io-worker', {autoDelete: false, durable: true}, (queue) ->
		logger.info('Started')
		queue.subscribe ack: true, (msg, object, queueOptions, originalDocument) ->
			jobStr = msg.data.toString('utf-8')
			logger.info(util.format('Received job: %s', jobStr))
			job = JSON.parse(jobStr)
			emitter.to(job.socketId).broadcast.emit('feedback', job.msg)
			originalDocument.acknowledge()

rmqConn.on 'error', (err) ->
	logger.error('RabbitMQ connection error: ' + err)
