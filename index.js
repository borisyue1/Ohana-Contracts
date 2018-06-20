var	schedule = require('node-schedule'),
	express = require("express"),
	app = express(),
	SSE = require('sse-express');

// var server = require('http').createServer(app);
var port = 8000;

// var rules = new Array();
// for (var i = 1; i < 61; i++) {
// 	var rule = new schedule.RecurrenceRule();
// 	rule.second = i;
// 	rules.push(rule);
// }
// console.log(rules[0].second)
// for (var i = 0; i < rules.length; i++) {
// 	(function(val) {
// 		schedule.scheduleJob(rules[val], function(){
// 		  console.log(rules[val].second);
// 		});
// 	})(i);
// }

app.use(express.static(__dirname + '/app'));


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/app/hi.html');
});

app.get('/sse', SSE, function(req, res) {
	res.sse('connected');
});

// app.use(express.static(__dirname + '/node_modules'));  


app.listen(port, function() {
	console.log("connected to port 8000")
});
