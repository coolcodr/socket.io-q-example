# socket.io-redis, socket.io-emitter, RabbitMQ

This is simple node.js application base on [socket.io-redis-sample](https://github.com/stoshiya/socket.io-redis-sample.git) and integrate with [socket.io-emitter](https://github.com/Automattic/socket.io-emitter) and [RabbitMQ](http://www.rabbitmq.com/)

## Usage

```
$ redis-server &
$ rabbitmq-server &
$ git clone https://github.com/stoshiya/socket.io-redis-sample.git
$ cd socket.io-redis-sample
$ npm install
$ PORT=3000 node app.js &
$ PORT=3001 node app.js &
$ coffee worker.coffee &
```

## License

MIT
