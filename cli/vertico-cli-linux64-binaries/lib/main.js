#!/usr/bin/env node
const ver = '0.0.1';
const logo = `
\\ \\    / /         | |  (_)            
 \\ \\  / /___  _ __ | |_  _   ___  ___  
  \\ \\/ // _ \\| '__|| __|| | / __|/ _ \\ 
   \\  /|  __/| |   | |_ | || (__| (_) |
    \\/  \\___||_|    \\__||_| \\___|\\___/ ` + ' Beta-' + ver;
console.log(logo);
var program = require('commander');
var request = require('superagent');
const chalk = require('chalk');
var volunteer = require('./register.js');
var AppService = require('./app-service.js');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
var Util = require('./util.js');
//var VerticoWeb = require('./web.js');
const log = console.log;


const running = false;

program
    .version(ver)
    .option('-r, --register <args>', 'Register this machine to my account using email and secret. \n\t\t\t      Example: `vertico -r test@gmail.com,secretkey`',list)
    .option('-s, --start', 'start the vertico Service')
    .option('-f, --fetch', 'start the vertico Service')
    .option('-p, --stop', 'pause the vertico Service')
    .option('-w, --web', 'web server')
    .parse(process.argv);



if (program.start) {
    if(!Util.check()) { console.log("Not registered!")  }
    startVerticoService(new Date().toISOString()+' Vertico Started', false);
    //setTimeout(startVerticoService, 4500, new Date().toISOString()+' - tick tick');
}

if (program.register) {
    console.log('list: %j', program.register);
    if(program.register.length != 2) {
        log(chalk.red('Invalid Parameters,please try \'vertico --help\''));
        return;
    }
    volunteer.register(program.register[0], program.register[1]);
}


if (program.kill) {
    console.log("killing it...")
    volunteer.unregister();
}

if (program.web) {
   VerticoWeb.startWebService();
}

if (program.fetch) {
  if(!Util.check()) { console.log("Not registered!")  }
  startVerticoService(new Date().toISOString()+' Vertico Started', true);
}




if (program.list == undefined) {
   Util.stats();
}

function list(val) {
  return val.split(',');
}

function startVerticoService(arg, force) {
  // fetch the job from vf
  // next if job is docker 
  // excute docker run command only if the status is Active
  // if virtual machien then run vm command
  // updateStatus
  // fetch list of apps
  // for all apps : 
    // if docker app : run start script
    // if inactive and : stop the script
  if(!Util.check()) return;

  Util.readAppData().then(
            data => {
                log(" Name                     :  " + data.name);
                log(" Unique Machine ID        :  " + data.id);
                AppService.runApps( data.id);
            }, err => { console.log(err) } );


  console.log(`: ${arg}`);
  if(!force)  setTimeout(startVerticoService, 10000, new Date().toISOString()+' - tick tick');
}