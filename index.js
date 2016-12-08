var express = require('express');
var app     = express();
var fs      = require('fs');
var request = require('request');
var KalmanFilter = require('kalmanjs').default;

// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/byod.crt', 'utf8');
var pfx = fs.readFileSync('sslcert/byod.pfx');
var credentials = {
    pfx: pfx,
    passphrase: 'byod'
};

var http    = require('http').Server(app);
var https   = require('https').Server(credentials, app);

var io  = require('socket.io')(http).attach(https);
var net = require('net');

var bunyan       = require("bunyan");
var prettyStream = require("bunyan-prettystream");
var stdoutPretty = new prettyStream();
stdoutPretty.pipe(process.stdout);

var log = bunyan.createLogger({
	name: "comfortLogger",
	level: "trace",
	serializers: {err: bunyan.stdSerializers.err},
	streams: [
	{
        type: "rotating-file",
        path: "./comfort.log",
        period: "1d",   // daily rotation
        count: 5        // keep 5 back copies
    },
	{
		stream: stdoutPretty
	}]
});

var notifierLog = bunyan.createLogger({
    name: "notifierLogger",
    level: "trace",
    serializers: {err: bunyan.stdSerializers.err},
    streams: [
    {
        type: "rotating-file",
        path: "./static/logs/eurekaLogs/eureka.log",
        period: "1d",   // daily rotation
        count: 5        // keep 5 back copies
    },
    {
        stream: stdoutPretty
    }]
});

var session     = require('express-session');
var RedisStore  = require('connect-redis')(session);
var redisPort   = 6379;
var redisHost   = "localhost";
var _SESSION    = null;
var bodyParser  = require('body-parser');

app.use(bodyParser.json({ limit: '50mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // support encoded bodies
app.use(session({
    store: new RedisStore({
		host: redisHost,
		port: redisPort,
		ttl: 30 * 60
	}),
    cookie: {
        httpOnly: false
    },
    secret: 'comffort-seccret-sesssion',
	resave: false,
	saveUninitialized: false
}));

var connected               = false;
var buffer                  = '';
// var comfortPort          = 1001;
// var comfortAddress       = '192.168.1.151';
var comfortPort             = 6969;
var comfortAddress          = 'localhost';
var commandQueue            = [];
var responseReceived        = true;
var logMsg                  = "";
var loginCmd                = "LI1234";
var intervalHandler         = null;
var connection              = null;
var startConnectionHandler  = null;
var jtsHost                 = "http://localhost:9999";
// var jtsHost                 = "http://119.73.206.46:4188";

app.use(express.static('static'));

var sendCommand = function (cmd) {
    if (commandQueue.indexOf(cmd) < 0) {
        commandQueue.push(cmd);
    }
};

var processQueue = function () {
    if (connected && responseReceived) {
        var cmd = commandQueue.shift();
        if (cmd != undefined && cmd.length > 1) {
			logMsg = 'Sending: ' + cmd;
			if(cmd.substring(0, 2) == 'cc'){
				log.trace(logMsg);				
			}else{
				log.info(logMsg);
			}
            connection.write('\x03' + cmd + '\x0D');
            responseReceived = false;
        }
    }
    setTimeout(processQueue, 0);
};

var connectedHandler = function () {
	logMsg = 'Connected to device.';
	log.info(logMsg);
	clearInterval(startConnectionHandler);
    connection.write('\x03' + loginCmd + '\x0D');
	log.info('Sending: ' + loginCmd);

    connection.on('end', function () {
		logMsg = 'Connection closed by client.';
		log.warn(logMsg);
    });

    connection.on('close', function () {
		logMsg = 'Connection closed.';
		log.warn(logMsg);
        commandQueue = [];
        connected = false;
		io.emit("connectionStateReport", connected);
        startConnection();
		clearInterval(intervalHandler);
    });

    connection.on('data', function (data) {
        buffer += data.toString();
        if (buffer.indexOf('\x0D') > buffer.indexOf('\x03')) {
            var ret = buffer.substring(buffer.indexOf('\x03') + 1, buffer.indexOf('\x0D'));
            buffer = buffer.substring(buffer.indexOf('\x0D') + 1);
			
			logMsg = 'Response received: ' + ret;
			if(ret.substring(0, 2) == 'cc'){
				log.trace(logMsg);				
			}else{
				log.info(logMsg);
			}

            parse(ret);
        }
    });
};

var startConnection = function () {
	startConnectionHandler = setInterval(function () {
		connection = net.createConnection(comfortPort, comfortAddress, connectedHandler);
		connection.on('error', function (err) {
			logMsg = 'Connection error. ' + err;
			log.error(logMsg);
			connected = false;
			io.emit("connectionStateReport", connected);
		});
	}, 5000);
};

startConnection();

var notifierServerHandler = function(conn) {
    // Identify this client
    conn.name = conn.remoteAddress + ":" + conn.remotePort 

    // Handle incoming messages from clients.
    conn.on('data', function (data) {
        var notifierReport = data.toString();
        logMsg = "Notification message: " + notifierReport;
        notifierLog.info(logMsg);
        io.emit("circuitNotifierReport", notifierReport);
    });

    // Remove the client from the list when it leaves
    conn.on('end', function () {
        logMsg = "Notifier client disconnected : " + conn.name;
        notifierLog.info(logMsg);
    });

    conn.on("error", function (err) {
        logMsg = "Notifier client error : " + conn.name;
        notifierLog.info(logMsg);
    });
};

var notifierServer = net.createServer(notifierServerHandler);

var parse = function (ret) {
    var cmd = ret.substring(0, 2);
    var address = ret.substring(2, 4);
    var value = ret.substring(4, 6);
    if (cmd == 'FL' || cmd == 'F?') {
        io.emit('flagStatusReport', address, value);
        io.emit('flagEventReport', ret);
        responseReceived = true;
    } else if (cmd == 'CT' || cmd == 'C?') {
        io.emit('counterReport', address, value);
        responseReceived = true;
	} else if (cmd == 's?') {
        io.emit('sensorReport', address, value);
        responseReceived = true;
    } else if (cmd == 'cc') {
        responseReceived = true;
    } else if (cmd == 'LU') {
        responseReceived = true;
        if (address == '00') {
            connection.destroy();
        } else if (address == '01') {
            connected = true;
			io.emit("connectionStateReport", connected);
        }
    } else if (cmd == 'PS') {
        intervalHandler = setInterval(function () {
            if (connected) {
                sendCommand('cc7777');	
            }
        }, 5000);
    } else if (cmd == 'NA'){
		responseReceived = true;
	}
};

app.get('/', function (req, res) {
    // res.sendFile(__dirname + '/index.html');
	res.redirect('/website/dist/');
	// res.redirect('/website/');
});

// Login
app.post('/auth/login', function (req, res) {
    _SESSION = req.session;
    _SESSION.userStatus = req.body.userStatus;
	_SESSION.userInfo = req.body.userInfo;
    console.log("POST", _SESSION);
	res.json(_SESSION);
});

app.get('/auth/login', function(req, res){
    _SESSION = req.session;
    console.log("GET", _SESSION);
	res.json(_SESSION);
});

app.get('/auth/logout', function(req, res){
	req.session.destroy(function(error){
		res.json(false);
	});
});

// Location
app.post("/auth/setLocationInfo", function(req, res) {
    _SESSION = req.session;
    _SESSION.locationInfo = req.body.locationInfo;
    res.json(_SESSION);
});

app.get("/auth/getLocationInfo", function(req, res) {
    _SESSION = req.session;
    res.json(_SESSION);
});

// User settings
app.post("/auth/setUserSettings", function(req, res) {
    _SESSION = req.session;
    _SESSION.userSettings = req.body.userSettings;
    res.json(_SESSION);
});

// Retrieve All Session Info
app.get("/auth/getSessionInfo", function(req, res) {
    _SESSION = req.session;
    res.json(_SESSION);
});

// Proxy Server Access for CORS
app.post("/node-proxy/saveOutstandingIssueAssignments", function(req, res) {
    var data = req.body;
    request({
        method: "POST",
        url: jtsHost + "/JTS/Issue/SaveOutstandingIssueAssignments",
        json: data
    }, function(error, response, body) {
        //Check for error
        if(error){
            return console.log('Error:', error);
        }

        //Check for right status code
        if(response.statusCode !== 200){
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }
    }).pipe(res);
});

// Kalman Filter
app.post("/kalmanFilter", function(req, res) {
    var data = req.body;
    var nearestDevice = null;
    var kf = new KalmanFilter({R: 0.01, Q: 3});

    data.forEach(function(matchedDevice, key) {
        var kalmanFilterResults = matchedDevice.signalStrengths.map(function(v) {
            return kf.filter(v);
        });

        var sum = 0;
        kalmanFilterResults.forEach(function(val, key) {
            sum = sum + val;
        });

        var avg = sum / kalmanFilterResults.length;
        matchedDevice.normalizedSignalStrength = avg;
        
        // Find nearest device by signal strength
        if(nearestDevice == null) {
            nearestDevice = matchedDevice;
        } else {
            if(nearestDevice.normalizedSignalStrength < matchedDevice.normalizedSignalStrength) {
                nearestDevice = matchedDevice;
            }
        }
    });

    res.json(nearestDevice);
});

app.post("/kalmanFilter2", function(req, res) {
    var data = req.body;
    var nearestDevice = null;
    var kf = new KalmanFilter({R: 0.01, Q: 3});

    data.forEach(function(matchedDevice, key) {
        var kalmanFilterResults = matchedDevice.signalStrengths.map(function(v) {
            return kf.filter(v);
        });

        var sum = 0;
        kalmanFilterResults.forEach(function(val, key) {
            sum = sum + val;
        });

        var avg = sum / kalmanFilterResults.length;
        matchedDevice.normalizedSignalStrength = avg;
        
        // Find nearest device by signal strength
        if(nearestDevice == null) {
            nearestDevice = matchedDevice;
        } else {
            if(nearestDevice.normalizedSignalStrength < matchedDevice.normalizedSignalStrength) {
                nearestDevice = matchedDevice;
            }
        }
    });

    res.json(nearestDevice);
});

app.get('/sendCommand/:command', function (req, res) {
    var command = req.params.command;
    sendCommand(command);
    res.json(true);
});

io.on('connection', function (socket) {
	logMsg = 'user connected';
	log.info(logMsg);
});

http.listen(3000, function () {
	logMsg = 'HTTP: listening on *:3000';
	log.info(logMsg);
});

https.listen(3300, function () {
    logMsg = 'HTTPS: listening on *:3300';
    log.info(logMsg);
});

notifierServer.listen(5000, function() {
    logMsg = 'Notifier Server: listening on *:5000';
    notifierLog.info(logMsg);
});

processQueue();