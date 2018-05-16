/*
 This program simulates a "data collection station", which joins a multicast
 group in order to receive measures published by thermometers (or other sensors).
 The measures are transported in json payloads with the following format:

   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}

 Usage: to start the station, use the following command in a terminal

   node auditor.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

//var moment = require("moment");

/*
 * We use a standard Node.js module to work with TCP
 */
var net = require('net');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
var socketUDP = dgram.createSocket('udp4');

socketUDP.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  socketUDP.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});


// Map the uuid with the musicians objects
var map = new Map();

var sounds = new Map();
sounds.set(protocol.PIANO, "piano");
sounds.set(protocol.TRUMPER, "trumpet");
sounds.set(protocol.FLUTE, "flute");
sounds.set(protocol.VIOLIN, "violin");
sounds.set(protocol.DRUM, "drum");

/* 
 * This call back is invoked when a new datagram has arrived.
 */
socketUDP.on('message', function(msg, source) {
	var newSound = JSON.parse(msg);
	var newMusician = {
		uuid: newSound.uuid,
		instrument: sounds.get(newSound.sound),
		activeSince: moment();
	};
  

	for (var i = 0; i < musicians.length; i++) {
		if (newMusician.uuid == musicians[i].uuid) {
			musicians[i].activeSince = newMusician.activeSince; // refresh the time remaining
			return;
		}
	}

	console.log("UUID " + newMusician.uuid);
	console.log("instrument " + newMusician.instrument);
	console.log("activeSince " + newMusician.activeSince);
	if(map.get(newMusician.uuid) == null){
		musicians.push(newMusician);
	}
	map.set(newMusician.uuid, newMusician);
	console.log("Data has arrived: " + msg + ". Source port: " + source.port);
});

function updateMusicians(){
    var currentTime = Date.now();
    for(var i = 0;  i < musicians.length; ++i){
        if(currentTime - musicians[i].activeSince > 5000){
            musicians.splice(i,1);
        }
    }
}
/* Will remove musicians not active since delay defined in the protocol*/
function fdfsff() {
	
    for (var i = 0; i < musicians.length; i++) {
        
        if (moment().diff(musicians[i].activeSince) > protocol.DELAY_TCP) {
            console.log('Musician removed : ' + JSON.stringify(musicians[i]));
            musicians.splice(i, 1);
        }
    }
}

function mapElementToJson(value, key, map){
	var mapElement = JSON.stringify(value);
	mapElement += ",";
}


var HOST = 'localhost';
var PORT = 2205;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
var serverTCP = net.createServer(function(socketTCP) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + socketTCP.remoteAddress +':'+ socketTCP.remotePort);

    // Add a 'data' event handler to this instance of socket
    socketTCP.on('data', function(data) {
	
		updateMusicians();
		var msg = JSON.stringify(musicians);
		
		socketTCP.write(msg);
		socketTCP.end();

	});

    
    // Add a 'close' event handler to this instance of socket
    socketTCP.on('close', function(data) {
        console.log('CLOSED: ' + socketTCP.remoteAddress +' '+ socketTCP.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
var musicians = new Array();