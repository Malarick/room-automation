var net = require('net');

var buffer = '';

var stateFlag = new Array();
for (var i = 0; i < 100; i++) {
    stateFlag.push('00');
}

var stateCounter = new Array();
for (var i = 0; i < 100; i++) {
    stateCounter.push('00');
}

var stateSensor = new Array();
for (var i = 0; i < 100; i++) {
    stateSensor.push('00');
}

var server = net.createServer(function (connection) {
    connection.on('error', function (err) {
        console.log('Connection error.');
    });
    connection.on('end', function () {
        console.log('Connection closed by client.');
    });

    connection.on('close', function () {
        console.log('Connection closed.');
    });
    connection.on('data', function (data) {
        buffer += data.toString();
        if (buffer.indexOf('\x0D') > buffer.indexOf('\x03')) {
            var req = buffer.substring(buffer.indexOf('\x03') + 1, buffer.indexOf('\x0D'));
            buffer = buffer.substring(buffer.indexOf('\x0D') + 1);
            console.log('Request received: ' + req);
            var cmd = req.substring(0, 2);
            var addr = req.substring(2, 4);
			
            if (cmd == 'F?') {			
                connection.write('\x03F?' + addr + stateFlag[parseInt(addr, 16)] + '\x0D');
            } else if (cmd == 'F!') {
                var st = req.substring(4, 6);
                stateFlag[parseInt(addr, 16)] = st;
                connection.write('\x03FL' + addr + stateFlag[parseInt(addr, 16)] + '\x0D');
            } else if (cmd == 'C?') {
                connection.write('\x03C?' + addr + stateCounter[parseInt(addr, 16)] + '\x0D');
            } else if (cmd == 'C!') {
                var st = req.substring(4, 6);
                stateCounter[parseInt(addr, 16)] = st;
                connection.write('\x03CT' + addr + stateCounter[parseInt(addr, 16)] + '\x0D');
            } else if (cmd == 's?') {
                connection.write('\x03s?' + addr + '0' + stateSensor[parseInt(addr, 16)] + '\x0D');
			} else if (cmd == 's!') {
                var st = req.substring(4, 6);
                stateSensor[parseInt(addr, 16)] = st;
                connection.write('\x03CT' + addr + stateSensor[parseInt(addr, 16)] + '\x0D');
            } else if (cmd == 'LI') {
                connection.write('\x03LU01\x0D');
				setTimeout(function(){
					connection.write('\x03PS01\x0D');
				}, 2000)
            } else if (cmd == 'cc') {
                connection.write('\x03cc7777\x0D');
            }
        }
    });
});

var port = 6969;
server.listen(port, function () {
   console.log('Emulator start on port ' + port);
});