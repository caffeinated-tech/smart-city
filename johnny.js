var five = require('johnny-five');

var board = new five.Board({
//	port: '/dev/ttyACM0'
	timeout: 3600
});

board.on('ready', function(){
	this.samplingInterval(1000);
	console.log('ready');
	var led = new five.Led(13);
	var photoresistor = new five.Light('A0');
	photoresistor.on('change',function(){
		console.log(this.level);
	});
	led.strobe();
});
