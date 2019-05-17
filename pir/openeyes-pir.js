/**
 * Copyright 2018 OPEN-EYES S.r.l.
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
		this.device = "/dev/input/event1";
		this.evtype = 5;
		this.evcode = 11;
		var node = this;

		var FS = require("fs");

        node.status({fill: "green", shape: "dot", text: 'link'});

        var options = { flags: 'r',encoding: null,fd: null,autoClose: true };

        // This line opens the file as a readable stream
        var readStream = FS.createReadStream(this.device,options);

        readStream.on('data', function(buf){
            var readElement = parse(buf);

            if (readElement != undefined ){
                if(readElement.type==node.evtype && readElement.code==node.evcode){
                    var event_str;

                    if(readElement.val)
                        event_str = "on";
                    else
                        event_str = "off";

                    var msg = {
                        type: "sensor",
                        topic: "pir",
                        presence: event_str
                    };

                    node.send({payload: msg});

                }
            }
        });

        readStream.on('error', function(e){
            node.status({fill: "red", shape: "dot", text: 'no device'});
            console.error(e);
        });

        this.on('close', function(readstream) {
            readstream.destroy();
		});

	}

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	RED.nodes.registerType("pir",PirSensor);
}
