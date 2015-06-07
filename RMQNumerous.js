var amqp = require('amqplib');
var when = require('when');
var moment = require('moment');


var cdlib = require('../cd_lib');

var rabbitMQ = {
    server: cdlib.getRabbitMQAddress(),
    username: 'test',
    password: 'test',
    virtualHost: '/test',
    queue: 'test1',
    msg: 'message not set',
    rabbitMQAuthString: function () {
        return 'amqp://' + this.username + ':' + this.password + '@' + this.server + this.virtualHost;
    }
}

var numerousMetricID = {
    'rabbitmqTest': '789238011944949713'
};


var sendNumerousConfig = {
    metricID: "",
    value: 0,
    getJSONString: "",
    getJSON: "",
    setValue: function (value) {
        this.value = value;
        this.createString();
    },
    setMetricID: function (metricID) {
        this.metricID = metricID;
        this.createString();
    },
    createString: function () {

    var currentTime = moment()._d;
        this.getJSONString = '{ "metricID": "' + this.metricID + '", "value": "' + this.value + '", "submitTime": "' + currentTime + '"}';
        this.getJSON = JSON.parse('{ "metricID": "' + this.metricID + '", "value": "' + this.value + '" }');
            },
    getValue: function () {
        return this.value;
    },
    getMetricID: function () {
        return this.metricID;
    }

}



//rabbitMQ.msg="here is the latest meesage";

sendNumerousConfig.setMetricID(numerousMetricID.rabbitmqTest);
sendNumerousConfig.setValue(1);

cdlib.sendRMQWorker(rabbitMQ,sendNumerousConfig.getJSONString);
