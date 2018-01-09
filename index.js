STREET_LIGHTS = [12,13,16,19,20,21,26];

var express = require("express");
var child_process = require("child_process");
var SerialPort = require('serialport');
var rpio = require("rpio");
var app = express();
var five = require('johnny-five');

// set rpio to access pins by their GPIOXX number, and set them all to output
rpio.init({ mapping: 'gpio' });
// initialize rp gpio pins as outputs
for(var i = 0; i < STREET_LIGHTS.length;i++){
	rpio.open(STREET_LIGHTS[i], rpio.OUTPUT, rpio.LOW);
}

// function to turn lights on / off
function toggleLights(value){
	for(var i=0;i< STREET_LIGHTS.length;i++){
		rpio.write(STREET_LIGHTS[i],value);
	}
}

// testing loop
//while(false){
//	toggleLights(rpio.HIGH);
//	rpio.sleep(5)
//	toggleLights(rpio.LOW);
//	rpio.sleep(5)
//}

// initialize connection to arduino
var board = five.Board({
	port: '/dev/ttyUSB0',
	repl: false
});
// threshold for when the leds should turn on / off
// lights off, only ambeint lighting (monitors etc.) is around 0.18
// lights on gives a reading around 0.75
var threshold = 0.5;

board.on('ready', function(){
	// sample all reads twice per second
	this.samplingInterval(500);
	// initialize photoresistor amd toggle lights on off when it falls below the threshold.
	var photoResistor = new five.Light('A0');
	photoResistor.on('change', function(){
		console.log("light level: " + this.level)
		if(this.level > threshold){
			toggleLights(rpio.LOW);
		} else {
			toggleLights(rpio.HIGH);
		}
	});
});


// API to toggle lights
app.get("/lights/:value", function(req, res){
	var value = req.params.value;

	if(value == 'on'){
		console.log("Toggle Lights ON");
		toggleLights(rpio.HIGH)
		res.send("Lights have been turned on!");
	} else if(value == 'off') {
		console.log("Toggle Lights OFF");
		toggleLights(rpio.LOW)
		res.send("Lights have been turned OFF!");
	} else {
		console.log("unknown command ", value);
		res.send("Unknown command!\nDon't know how to turn lights " + value);
	}
});

console.log("listening on port 3000")
app.listen(3000);

