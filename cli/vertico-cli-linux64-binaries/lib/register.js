var request = require('superagent');
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('lib/config.file');
var registerEndPoint = properties.get('vf.endpoint.register');
var validateAPIKey = properties.get('vf.endpoint.validateAPIKey');
var registerInstance = properties.get('vf.endpoint.registerInstance');
var Util = require('./util.js');
var sys = require('./refresh-system-info.js');
/**
 * Register - Registers the volunteer machine.
 * Flow - secret key will be generated for user, which is given as input this function.
 * Using that secret key we validate again. If that perticular scret exist then user is 
 * valid else not.
 * If valid - Success and Post system information, set credits to 0.
 * If not valid - Show failure message
 * 
 * {
        "os": "test os",
        "privateIP": "1.1.2.2",
        "cpu": "i7",
        "publicIP": "1.1.1.1",
        "version": 2,
        "credits": 10000,
        "diskSpace": "100TB",
        "nickname": "test",
        "ram": "16GB",
        "status": "ACTIVE",
        "info": "123",
        "donor":{"id" : "28630a5a-01c4-8a6e-4b64-5e4baef0a7b5"}
        
    }
 */

exports.stop = function (email, secret) {
     console.log(Util.readAppData())
}

exports.register = function (email, secret) {
    if(Util.check()) return;
    request.get(validateAPIKey + '?email=' + email + '&secretKey=' + secret)
        .set('Content-Type', 'application/json')
        .end(function (err, data) {
            if (err) {
                console.log(err);
                return;
            }

            sys.refresh().then(sysData => {
                var instanceObj = {
                    os: sysData.osInfo.distro,
                    privateIP: sysData.internal_ip,
                    cpu: sysData.cpu.manufacturer + ' ' + sysData.cpu.brand,
                    publicIP: sysData.external_ip,
                    credits: 100,
                    diskSpace: sysData.fileSystem.free,
                    nickname: Util.getUniqueID(),
                    ram: sysData.memory.total,
                    status: "ACTIVE",
                    donor: {
                        id:
                        data.body[0].id
                    },
                    info: JSON.stringify(sysData, null, 4)
                };
                request.post(registerInstance)
                    .set('Content-Type', 'application/json')
                    .send(instanceObj)
                    .end(function (err, success) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        var out = {
                            id :success.body.id,
                            name : success.body.nickname,
                            secretKey:secret,
                            email:email
                        }
                        callback(err, out)
                    });


                console.log(instanceObj);
            }).
                catch(err => {
                    return err;
                    console.log('Error While Refreshing the System Status')
                });
        });

    // Util.getInstanceDetails().then( data=> {console.log(data)} );

}


exports.unregister = function () {
    console.log("Deleting the user id = " + Util.getID())
    request.delete(registerEndPoint + "/" + Util.getID())
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(Util.getVolunteer()))
        .end(function (err, res) {
            if (!err) {
                console.log("Deleted it successfully");
            } else {
                console.log("error")
            }
        });
}

function callback(err, out) {
    if (!err) {
        Util.writeCreationLock(JSON.stringify(out, null, ' '));
    } else {
        console.log(err);
    }
}

