/**
 * Copyright 2018 Massimiliano Negretti
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

module.exports = function(RED) {
  "use strict";

	function parse(buffer) {
		return {
			type: buffer.readUInt16LE(8),
			code: buffer.readUInt16LE(10),
			val:  buffer.readUInt32LE(12)
		}
	}

	// The main node definition - most things happen in here
	function PirSensor(n) {
		// Create a RED node
		RED.nodes.createNode(this,n);

		// Store local copies of the node configuration (as defined in the .html)
		var msg = { topic: "pir" };
		this.device = "/dev/input/event0";
		this.evtype = 5;
		this.evcode = 11;
		var node = this;

		var FS = require("fs");
		var closeFS = 0;

		if (!FS.existsSync(node.device)) {
			throw "Info : Pir Sensor node can't find device." + node.device;
		}

		// This is the stuff that's actually happening in the node
		FS.open(node.device, "r", function (err, fd) {
			if (err) throw err;

			var buffer = new Buffer.alloc(16);

			function startRead() {
				FS.read(fd, buffer, 0, 16, null, function (err, bytesRead) {
					var readElement = parse(buffer);

					if (readElement != undefined ){
						if(readElement.type==node.evtype && readElement.code==node.evcode){
							var mystring = "Event" + readElement.val;
							msg.payload=mystring;
							node.send(msg);
						}
					}

					if (closeFS == 1) {
						FS.close(fd)
					} else {
						startRead();
					}

			    	 });
			}

			startRead();

		});

		this.on('close', function() {
			closeFS = 1;
		});

	}

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	RED.nodes.registerType("pir",PirSensor);
}
