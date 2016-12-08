var net = require('net');
var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var port = 5000;
var address = "localhost";
// var address = "119.73.206.44";
var connection = null;
var startConnectionHandler = null;
var messageSenderHandler = null;
var currSequence = false;
var promptLabel = "Enter 1 to send device 1 failure\nEnter 2 to send device 1 recovery\nEnter 3 to send device 2 failure\nEnter 4 to send device 2 recovery\n> ";

rl.setPrompt(promptLabel);

var connectionHandler = function() {
    console.log("Connected to notifier server.");
    clearInterval(startConnectionHandler);

    connection.on('end', function () {
        console.log('Connection closed by client.');
    });

    connection.on('close', function () {
        console.log('Connection closed.');
        startConnection();
    });

    connection.on('data', function (data) {
        data = data.toString();
    });

    rl.prompt();
    rl.on("line", function(input) {
        switch(input) {
            case "1":
                console.log("Sending: 31/10/16 22:09:33;428;dev1f");
                connection.write("31/10/16 22:09:33;428;dev1f");
                break;
            case "2":
                console.log("Sending: 31/10/16 22:09:33;428;dev1r");
                connection.write("31/10/16 22:09:33;428;dev1r");
                break;
            case "3":
                console.log("Sending: 31/10/16 22:09:33;428;dev2f");
                connection.write("31/10/16 22:09:33;428;dev2f");
                break;
            case "4":
                console.log("Sending: 31/10/16 22:09:33;428;dev2r");
                connection.write("31/10/16 22:09:33;428;dev2r");
                break;
            default:
                console.log("Command unrecognized, please try again.");
        }
        rl.prompt();
    });
};

var startConnection = function() {
    clearInterval(messageSenderHandler);
    startConnectionHandler = setInterval(function() {
        connection = net.createConnection(port, address, connectionHandler);
        connection.on('error', function (err) {
            console.log('Connection error.');
        });
    }, 5000);
};

startConnection();