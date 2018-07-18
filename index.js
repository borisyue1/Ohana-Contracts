const	express 	= require("express"),
		app		 	= express(),
	    bodyParser 	= require('body-parser'); //parses the body portion of an incoming HTTP request and makes it easier to extract different parts of the contained information


// const scheduler = require('./scheduler.js')(); //runs the scheduler
// Setup RPC connection   
const port = process.env.PORT || 8000;

// app.use(express.static(__dirname + '/app'));

//app.use - uses function as middleware for incoming requests
app.use(bodyParser.json()); //use as middleware to parse incoming request data
app.use(bodyParser.urlencoded({ extended: false }));

const 	userRouter		  = require('./app/routes/user.routes.js'),
		adminRouter 	  = require('./app/routes/admin.routes.js'),
		leaderboardRouter = require('./app/routes/leaderboard.routes.js'),
		ownerRouter 	  = require('./app/routes/owner.routes.js'),
		scheduleRouter	  = require('./app/routes/scheduler.routes.js');

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/owner', ownerRouter);
app.use('/scheduler', scheduleRouter);


app.listen(port, () => {
	console.log("connected to port 8000")
});

