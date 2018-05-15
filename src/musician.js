/*
 This program simulates a musician playing an instrument, which emit sounds
 on a multicast group. Other programs can join the group and receive the sounds. The
 sounds are transported in json payloads with the following format:

   {"sound": "tut-tut"}

 Usage: to start a thermometer, type the following command in a terminal
        (of course, you can run several musician in parallel and observe that all
        sounds are transmitted via the multicast group):

   node musician.js instrument

*/

var protocol = require('./protocol');


var instruments = new Map();
instruments.set("piano", protocol.PIANO);
instruments.set("trumpet", protocol.TRUMPER);
instruments.set("flute", protocol.FLUTE);
instruments.set("violin", protocol.VIOLIN);
instruments.set("drum", protocol.DRUM);

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var socketUDP = dgram.createSocket('udp4');

/*
 * Let's define a javascript class for our musician. The constructor accepts
 * an instrument at every iteration
 */
function Musician(instrument) {

	this.instrument = instrument;
	this.uuid = generateUUID();

	/*
	   * We will simulate a musician playing an instrument and emit sound on a regular basis. That is something that
	   * we implement in a class method (via the prototype)
	   */
	Musician.prototype.update = function () {

		/*
		  * Let's create the sound emission as a dynamic javascript object, 
		  * add corresponding sound (timestamp, location and temperature)
		  * and serialize the object to a JSON string
		  */
		var soundEmission = {
			uuid: this.uuid,
			sound: getSound(this.instrument)
		};
		var payload = JSON.stringify(soundEmission);

		/*		
		 * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	     * the multicast address. All subscribers to this address will receive the message.
	     */
		message = new Buffer(payload);
		socketUDP.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
			console.log("Sending payload: " + payload + " via port " + socketUDP.address().port);
		});

	}

	/*
	 * Let's take and send a sound every second
	 */
	setInterval(this.update.bind(this), protocol.SOUND_INTERVAL);
}

function generateUUID() { // Public Domain/MIT
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getSound(instrument) {
	
	switch (instrument) {
		case "piano":
			return "ti-ta-ti";
		case "trumpet":
			return "pouet";
		case "flute":
			return "trulu";
		case "violin":
			return "gzi-gzi";
		case "drum":
			return "boum-boum";
		default:
			return null;
	}
}

/*
 * Let's get the musician properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
var instrument = process.argv[2];
var uuid = null;

/*
 * Let's create a new musician - the regular publication of measures will
 * be initiated within the constructor
 */
var m1 = new Musician(instrument);