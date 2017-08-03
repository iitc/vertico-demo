'use strict';
var request = require('superagent');
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('lib/config.file');
var myAppsEndpoint = properties.get('vf.endpoint.myapps');

var Util = require('./util.js');
var sys = require('./refresh-system-info.js');



function runDockerApp(app) {
    console.log("Running app id=" + app.id)
    var cmds = app.initScript.split(' ');

    const
        spawn = require('child_process').spawn,
        dockerDeamon = spawn(cmds[0], cmds.splice(1, cmds.length));
    
    dockerDeamon.stdout.on('data', data => {
        console.log(`${data}`);
    });

    dockerDeamon.stderr.on('data', data => {
        console.log(`${data}`);
    });

    dockerDeamon.on('close', code => {
     //   console.log(`Done! ${code}`);
    });

}
exports.runApps = function (id) {

    request.get(myAppsEndpoint + id)
        .set('Content-Type', 'application/json')
        .end(function (err, data) {
            Util.writeAppsData(data.body);
            var apps = data.body;
            for (var i = 0; i < apps.length; i++) {
                if (apps[i].appType == "container") {
                    runDockerApp(apps[i]);
                }
            }
            if (err) {
                console.log(err);
                return;
            }

        });
}

