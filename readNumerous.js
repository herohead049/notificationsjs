var amqp = require('amqplib');
var when = require('when');
var Promise =  require('bluebird');


var cdlib = require('../cd_lib');

var rabbitMQ = {
    server: cdlib.getRabbitMQAddress(),
    username: 'test',
    password: 'test',
    virtualHost: '/test',
    queue: 'test1',
    msg: '',
    rabbitMQAuthString: function () {
        return 'amqp://' + this.username + ':' + this.password + '@' + this.server + this.virtualHost;
    }
}

/**

cdlib.getRMQWorker(rabbitMQ)
    .then(function (msg) {
        var m = JSON.parse(msg.body).metricID;
        var v = JSON.parse(msg.body).value;
        cdlib.updateNumerous(m,parseInt(v ,10 ));
        return msg;
}).then( function (msg) {//console.log(msg.body);
        msg.ch.ack(msg.msg);
}).catch (function (msg) {
        msg.ch.nack(msg.msg);
})

**/


amqp.connect(rabbitMQ.rabbitMQAuthString()).then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    var ok = ch.assertQueue(rabbitMQ.queue, {durable: true});
    ok = ok.then(function() { ch.prefetch(1); });
    ok = ok.then(function() {
      ch.consume(rabbitMQ.queue, doWork, {noAck: false});
      console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
    return ok;

    function doWork(msg) {
      var body = msg.content.toString();
      console.log(" [x] Received '%s'", body);
      var secs = body.split('.').length - 1;
      console.log(" [x] Task takes %d seconds", secs);
      setTimeout(function() {
        console.log(" [x] Done");
        var m = JSON.parse(body).metricID;
        var v = JSON.parse(body).value;

          cdlib.updateNumerous(m,parseInt(v ,10 ))
            .then(function () {
              ch.ack(msg);
          }).catch(function () {
              console.log("Problem sending to numerous");
              ch.nack(msg);
          })


          //ch.ack(msg);
          //console.log(JSON.parse(body).value);
        //cdlib.updateNumerous(numerousMetricID.rabbitmqTest,1);
      }, secs * 1000);
    }
  });
}).then(null, console.warn);

