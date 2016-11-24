/*
 * Copyright (c) 2016 Michael Jacobsen (github.com/mikejac)
 * 
 * This file is part of Node-RED Cayenne MQTT.
 * 
 * Node-RED Cayenne MQTT is free software: you can redistribute 
 * it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * Node-RED Cayenne MQTT is distributed in the hope that it will
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Node-RED Cayenne MQTT.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

module.exports = function(RED) {
    "use strict"

	/******************************************************************************************************************
	 * 
	 *
	 */
    function CayenneActuatorFeedbackNode(config) {
        //console.log("CayenneSensorNode(): config =", config)

        RED.nodes.createNode(this, config)

        this.qos = parseInt(config.qos)
        if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
            this.qos = 0
        }

        this.channel    = config.channel
        this.datatype   = config.datatypeEx
        this.dataunit   = config.dataunitEx
        this.valuetype  = config.valuetypeEx

        this.client     = config.client
        this.clientConn = RED.nodes.getNode(this.client)    // the configuration

        this.broker     = this.clientConn.broker
        this.brokerConn = RED.nodes.getNode(this.broker)    // the MQTT broker

        var node = this

        if (this.brokerConn) {
            updateNodeStatus(this, false)

            if (this.channel) {
                //
                // build subscribe topic
                //
                this.topic =    "v1/" + 
                                this.clientConn.username + 
                                "/things/" + 
                                this.clientConn.clientid + 
                                "/cmd/" +
                                this.channel

                RED.log.debug("subscribe topic = " + this.topic)

                node.brokerConn.register(this)

                this.brokerConn.subscribe(this.topic, this.qos, function(topic, payload, packet) {
                    try {
                        payload = payload.toString()

                        var msg = {topic:topic, payload:payload, qos:packet.qos, retain:packet.retain}

                        RED.log.debug("message from cayenne = " + msg)

                        var req = msg.payload.split(",")

                        msg.sequence    = req[0]
                        msg.payload     = parseInt(req[1])
                        msg.channel     = node.channel

                        node.send(msg)

                        //
                        // now send response to Cayenne
                        //
                        msg.topic = "v1/" + 
                                    node.clientConn.username + 
                                    "/things/" + 
                                    node.clientConn.clientid + 
                                    "/response/" +
                                    node.channel

                        msg.payload = "ok," + req[0]

                        RED.log.debug("response topic   = " + msg.topic)
                        RED.log.debug("response payload = " + msg.payload)

                        node.brokerConn.publish(msg)  // send the message

                        node.valueOut = "ok"
                        updateNodeStatus(node, node.brokerConn.connected, node.valueIn, node.valueOut)
                    } catch(err) {
                        node.error(err)
                    }
                }, this.id)

                updateNodeStatus(node, node.brokerConn.connected)
            } else {
                node.error(RED._("cayenne.errors.missing-config"))
            }
            
            this.on('close', function(done) {
                if (node.brokerConn) {
                    node.brokerConn.unsubscribe(node.topic, node.id)
                    node.brokerConn.deregister(node, done)
                }
            })
        } else {
            this.error(RED._("cayenne.errors.missing-config"))
        }

        this.on('input', function (msg) {
            var val

            if (typeof msg.payload === 'string') {
                val = parseInt(msg.payload)
            } else if (typeof msg.payload === 'number') {
                val = msg.payload
            } else if (typeof msg.payload === 'boolean') {
                if (msg.payload == false) {
                    val = 0
                } else {
                    val = 1
                }
            } else if (typeof msg.payload === 'object') {
                node.error(RED._("cayenne.errors.invalid-value-type"))
                return
            } else {
                node.error(RED._("cayenne.errors.invalid-value-type"))
                return
            }

            msg.payload = val            
            msg.topic   =   "v1/" + 
                            node.clientConn.username + 
                            "/things/" + 
                            node.clientConn.clientid + 
                            "/" +
                            node.valuetype +
                            "/" +
                            node.channel

            RED.log.debug("reply topic   = " + msg.topic)
            RED.log.debug("reply payload = " + msg.payload)

            node.brokerConn.publish(msg)  // send the message

            node.valueIn = val
            updateNodeStatus(node, node.brokerConn.connected, node.valueIn, node.valueOut)
        })
    }

    RED.nodes.registerType("cayenne actuator-feedback", CayenneActuatorFeedbackNode)

	/******************************************************************************************************************
	 * 
	 *
	 */
    function CayenneActuatorNode(config) {
        //console.log("CayenneSensorNode(): config =", config)

        RED.nodes.createNode(this, config)

        this.qos = parseInt(config.qos)
        if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
            this.qos = 0;
        }

        this.channel    = config.channel
        this.datatype   = config.datatypeEx
        this.dataunit   = config.dataunitEx
        this.valuetype  = config.valuetypeEx

        this.client     = config.client
        this.clientConn = RED.nodes.getNode(this.client)    // the configuration

        this.broker     = this.clientConn.broker
        this.brokerConn = RED.nodes.getNode(this.broker)    // the MQTT broker

        var node = this

        if (this.brokerConn) {
            updateNodeStatus(this, false)

            if (this.channel) {
                //
                // build subscribe topic
                //
                this.topic =    "v1/" + 
                                this.clientConn.username + 
                                "/things/" + 
                                this.clientConn.clientid + 
                                "/cmd/" +
                                this.channel

                RED.log.debug("subscribe topic = " + this.topic)

                node.brokerConn.register(this)

                this.brokerConn.subscribe(this.topic, this.qos, function(topic, payload, packet) {
                    try {
                        payload = payload.toString()

                        var msg = {topic:topic, payload:payload, qos:packet.qos, retain:packet.retain}

                        RED.log.debug("message from cayenne = " + msg)

                        var req = msg.payload.split(",")

                        msg.sequence    = req[0]
                        msg.payload     = parseInt(req[1])
                        msg.channel     = node.channel

                        node.send(msg)

                        //
                        // now send reply to Cayenne
                        //
                        msg.topic = "v1/" + 
                                    node.clientConn.username + 
                                    "/things/" + 
                                    node.clientConn.clientid + 
                                    "/" +
                                    node.valuetype +
                                    "/" +
                                    node.channel

                        RED.log.debug("reply topic   = " + msg.topic)
                        RED.log.debug("reply payload = " + msg.payload)

                        node.brokerConn.publish(msg)  // send the message

                        msg.topic = "v1/" + 
                                    node.clientConn.username + 
                                    "/things/" + 
                                    node.clientConn.clientid + 
                                    "/response/" +
                                    node.channel

                        msg.payload = "ok," + req[0]

                        RED.log.debug("response topic   = " + msg.topic)
                        RED.log.debug("response payload = " + msg.payload)

                        node.brokerConn.publish(msg)  // send the message

                        node.valueOut = "ok"
                        updateNodeStatus(node, node.brokerConn.connected, node.valueIn, node.valueOut)
                    } catch(err) {
                        node.error(err)
                    }
                }, this.id)

                updateNodeStatus(node, node.brokerConn.connected)
            } else {
                node.log(RED._("cayenne.errors.missing-config"))
            }
            
            this.on('close', function(done) {
                if (node.brokerConn) {
                    node.brokerConn.unsubscribe(node.topic, node.id)
                    node.brokerConn.deregister(node, done)
                }
            })
        } else {
            this.log(RED._("cayenne.errors.missing-config"))
        }
    }

    RED.nodes.registerType("cayenne actuator", CayenneActuatorNode)

	/******************************************************************************************************************
	 * 
	 *
	 */
    function CayenneSensorNode(config) {
        //console.log("CayenneSensorNode(): config =", config)

        RED.nodes.createNode(this, config)

        this.qos = parseInt(config.qos)
        if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
            this.qos = 0;
        }

        this.channel    = config.channel
        this.datatype   = config.datatypeEx
        this.dataunit   = config.dataunitEx

        this.client     = config.client
        this.clientConn = RED.nodes.getNode(this.client)    // the configuration

        this.broker     = this.clientConn.broker
        this.brokerConn = RED.nodes.getNode(this.broker)    // the MQTT broker

        var node = this

        if (this.brokerConn) {
            updateNodeStatus(this, false)

            this.on("input", function(msg) {
                try {
                    var topic
                    var val

                    /******************************************************************************************************************
                     * determine incoming message type
                     *
                     */
                    if (msg.hasOwnProperty("fabric")) {
                        var checks = 0

                        if (msg.fabric.hasOwnProperty("type")) {
                            checks++
                        }
                        if (msg.fabric.hasOwnProperty("nodename")) {
                            checks++
                        }
                        if (msg.fabric.hasOwnProperty("aid")) {
                            checks++
                        }
                        if (msg.fabric.hasOwnProperty("iid")) {
                            checks++
                        }
                        if (msg.fabric.hasOwnProperty("value")) {
                            checks++
                        }
                        if (msg.fabric.hasOwnProperty("format")) {
                            checks++
                        }
                        if (msg.fabric.type == "value") {
                            checks++
                        }

                        if (checks == 7) {
                            //
                            // build topic
                            //
                            if (node.channel == "") {
                                topic = "v1/" + 
                                        node.clientConn.username + 
                                        "/things/" + 
                                        node.clientConn.clientid + 
                                        "/data/" +
                                        msg.fabric.nodename +
                                        "_" +
                                        msg.fabric.aid.toString() +
                                        "_" +
                                        msg.fabric.iid.toString()
                            } else {
                                topic = "v1/" + 
                                        node.clientConn.username + 
                                        "/things/" + 
                                        node.clientConn.clientid + 
                                        "/data/" +
                                        node.channel
                            }

                            val = msg.fabric.value
                        } else {
                            node.error("fabric message is missing one or more fields")
                            return
                        }
                    } else if (msg.hasOwnProperty("payload")) {
                        //
                        // build topic
                        //
                        topic = "v1/" + 
                                node.clientConn.username + 
                                "/things/" + 
                                node.clientConn.clientid + 
                                "/data/" +
                                node.channel

                        val = msg.payload
                    } else {
                        node.error("message has no payload")
                        return
                    }

                    RED.log.debug("sensor topic = " + topic)
                    RED.log.debug("sensor val   = " + val)

                    if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(topic)) {
                        node.error(RED._("cayenne.errors.invalid-topic"))
                        return
                    }

                    if (typeof val === 'string') {

                    } else if (typeof val === 'number') {

                    } else if (typeof val === 'boolean') {
                        if (val == false) {
                            val = 0
                        } else {
                            val = 1
                        }
                    } else if (typeof val === 'object') {
                        node.error(RED._("cayenne.errors.invalid-value-type"))
                        return
                    } else {
                        node.error(RED._("cayenne.errors.invalid-value-type"))
                        return
                    }

                    var payload

                    if (node.datatype == "_none_" || node.dataunit == "_none_") {
                        payload = val //.toString()
                    } else {
                        payload = node.datatype + "," + node.dataunit + "=" + val
                    }

                    RED.log.debug("sensor payload = " + payload)

                    // build Cayenne MQTT message
                    msg.qos     = node.qos
                    msg.retain  = false
                    msg.topic   = topic
                    msg.payload = payload

                    node.brokerConn.publish(msg)  // send the message

                    node.valueIn = val
                    updateNodeStatus(node, node.brokerConn.connected, node.valueIn, node.valueOut)
                } catch(err) {
                    node.log(err)
                }
            })

            updateNodeStatus(node, node.brokerConn.connected)

            node.brokerConn.register(node)
            
            this.on('close', function(done) {
                node.brokerConn.deregister(node, done)
            })
        } else {
            this.error(RED._("cayenne.errors.missing-config"))
        }
    }

    RED.nodes.registerType("cayenne sensor", CayenneSensorNode)

	/******************************************************************************************************************
	 * 
	 *
	 */
    function updateNodeStatus(node, connected, valueIn, valueOut) {
        var text = timeNowString()

        if (typeof valueIn === 'undefined') {
            //valueIn = "n/a"
        } else {
            text = text + " I: " + valueIn
        }

        if (typeof valueOut === 'undefined') {
            //valueOut = "n/a"
        } else {
            text = text + " O: " + valueOut
        }

        if (connected == true) {
            node.status({fill:"green", shape:"dot", text:text})
        } else {
            node.status({fill:"red", shape:"ring", text:text})
        }
    }

	/******************************************************************************************************************
	 * 
	 *
	 */
    function CayenneClientNode(config) {
        RED.nodes.createNode(this, config)

        this.username   = config.username
        this.clientid   = config.clientid
        this.broker     = config.broker
        this.brokerConn = RED.nodes.getNode(this.broker)    // the MQTT broker

        var node = this

        if (this.brokerConn) {
            node.brokerConn.register(node)
        } else {
            this.error(RED._("cayenne.errors.missing-config"))
        }

        this.on('close', function(done) {
            node.brokerConn.deregister(node, done)
        })
    }

    RED.nodes.registerType("cayenne-client", CayenneClientNode)

	/******************************************************************************************************************
	 * homemade - can't find a way to change the locale :-(
	 *
	 */
    function timeNowString() {
        var now     =   new Date()

        var h       = ("0" + (now.getHours())).slice(-2)
        var m       = ("0" + (now.getMinutes())).slice(-2)
        var s       = ("0" + (now.getSeconds())).slice(-2)

        var nowText = h + ":" + m + ":" + s

        return nowText
    }

}
