const	schedule 	= require('node-schedule'),
		express 	= require("express"),
		app		 	= express(),
	    bodyParser 	= require('body-parser'); //parses the body portion of an incoming HTTP request and makes it easier to extract different parts of the contained information

// Setup RPC connection   
const port = process.env.PORT || 8000;

// var rules = new Array();
// for (var i = 1; i < 61; i++) {
// 	var rule = new schedule.RecurrenceRule();
// 	rule.minute = i;
// 	rules.push(rule);
// }
// console.log(rules[0].second)
// for (var i = 0; i < rules.length; i++) {
// 	((val) => {
// 		schedule.scheduleJob(rules[val], function(){
// 		  console.log(rules[val].minute);
// 		});
// 	})(i);
// }

// app.use(express.static(__dirname + '/app'));

//app.use - uses function as middleware for incoming requests
app.use(bodyParser.json()); //use as middleware to parse incoming request data
app.use(bodyParser.urlencoded({ extended: false }));

const 	userRouter		  = require('./app/routes/user.routes.js'),
		adminRouter 	  = require('./app/routes/admin.routes.js'),
		leaderboardRouter = require('./app/routes/leaderboard.routes.js'),
		ownerRouter 	  = require('./app/routes/owner.routes.js');

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/owner', ownerRouter);


app.listen(port, () => {
	console.log("connected to port 8000")
});
