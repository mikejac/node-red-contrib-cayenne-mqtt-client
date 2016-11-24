# node-red-contrib-cayenne-mqtt-client

This node allows you to hook up Node-RED to interface with Cayenne `Bring Your Own Thing`.

In order to use this node you will require an account with 
[Cayenne](https://cayenne.mydevices.com/).

## Install
```
cd $HOME/.node-red
npm install node-red-contrib-cayenne-mqtt-client
```

## Version History
### 0.0.2 - 2016-11-24
- All Cayenne Actuator Types now selectable in the dropdown list.
- All Cayenne Sensor Types now selectable in the dropdown list.
- The Nodes sends various logs to Node-REDs logging system. The logs are sent as `debug`. You must edit your `settings.js` file in order to see them.

`Note:` Only a (small) subset of the Actuators and Sensors are currently supported by Cayenne.
### 0.0.1 - 2016-11-19
Initial Version.
