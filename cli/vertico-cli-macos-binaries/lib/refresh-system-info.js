 // npm install systeminformation --save
 'use strict';

 const { promisify } = require('util');
 const getIP = promisify(require('external-ip')()); 
 const si = require('systeminformation');
 var beautify = require("json-beautify");
 var flag = true;


 exports.refresh = function () {
     var info = {};

     return getSystem(info)
         .then(getIPAddress)
         .then(getOSInfo)
         .then(getMem)
         .then(getCPU)
         .then(getFileSZ)
         .then(getNetworkInfo);

     function getIPAddress() {
         return getIP().then((ip) => {
             info.external_ip = ip;
             info.internal_ip = require("ip").address();
             return info;
         });
     }

     function getSystem() {
         return si.system().then(data => {
             delete data['serial'];
             delete data['uuid'];
             info.system = data;
             return info;
         });
     }

     function getCPU() {
         return si.cpu().then(data => {
             info.cpu = data;
             return info;
         });

     }

     function getMem() {
         return si.mem().then(data => {
             info.memory = formatUserFriendlyMemory(data, flag);
             return info;
         });

     }

     function getOSInfo() {
         return si.osInfo().then(data => {
             delete data['hostname'];
             info.osInfo = data;
             return info;

         });
     }

     function getFileSZ() {
         return si.fsSize().then(data => {
             info.fileSystem = formatUserFriendlyFileSystem(data[0], flag);
             return info;
         });
     }

     function getNetworkInfo() {
         return si.networkInterfaces()
             .then(data => {
                 info.networkInfo = data;
                 return info;
             });
     }


 }


function formatUserFriendlyMemory(data, flag) {
     if (!flag) return data;
     data.total = (data.total) / 1024 / 1024 / 1024 + " GB";
     data.free = (data.free) / 1024 / 1024 + " MB";
     data.used = (data.used) / 1024 / 1024 + " MB";
     data.active = (data.active) / 1024 / 1024 + " MB";
     data.available = (data.available) / 1024 / 1024 + " MB";
     data.buffcache = (data.buffcache) / 1024 / 1024 + " MB";
     return data;
 }

 function formatUserFriendlyFileSystem(data, flag) {
     if (!flag) return data;
     data.free = data.size - data.used;
     data.size = (data.size) / 1024 / 1024 / 1024 + " GB";
     data.free = (data.free) / 1024 / 1024 / 1024 + " GB";
     data.used = (data.used) / 1024 / 1024 / 1024 + " MB";
     return data;
 }

/**

Usage : 
 this.refresh().then(info => {
      console.log(JSON.stringify(info, null, ' '))
  }).
  catch(err => {
      console.log('Error While Refreshing the System Status')
  })
  

Expected output :

{
 "system": {
  "manufacturer": "Apple Inc.",
  "model": "MacBookPro12,1",
  "version": "1.0"
 },
 "external_ip": "",
 "osInfo": {
  "platform": "Darwin",
  "distro": "Mac OS X",
  "release": "10.12.5",
  "codename": "",
  "kernel": "16.6.0",
  "arch": "x64",
  "logofile": "apple"
 },
 "memory": {
  "total": "8 GB",
  "free": "295.453125 MB",
  "used": "7896.546875 MB",
  "active": "2964.23828125 MB",
  "available": "5227.76171875 MB",
  "buffcache": "4932.30859375 MB",
  "swaptotal": 2147483648,
  "swapused": 809762816,
  "swapfree": 1337720832
 },
 "cpu": {
  "manufacturer": "Intel®",
  "brand": "Core™ i5-5257U",
  "vendor": "GenuineIntel",
  "family": "6",
  "model": "61",
  "stepping": "4",
  "revision": "",
  "speed": "2.70",
  "speedmin": "2.70",
  "speedmax": "2.70",
  "cores": 4,
  "cache": {
   "l1d": 32768,
   "l1i": 32768,
   "l2": 262144,
   "l3": 3145728
  }
 },
 "fileSystem": {
  "fs": "/dev/disk1",
  "type": "HFS",
  "size": "111.859375 GB",
  "used": "103.3229866027832 MB",
  "use": 92.37,
  "mount": "/",
  "free": "8.536388397216797 GB"
 },
 "networkInfo": [
  {
   "iface": "lo0",
   "ip4": "127.0.0.1",
   "ip6": "fe80::1",
   "mac": "fe:80:00:00:00:00",
   "internal": true
  },
  {
   "iface": "en0",
   "ip4": "192.168.0.11",
   "ip6": "fe80::1c3e:a586:c516:5d69",
   "mac": "06:00:00:06:0e:00",
   "internal": false
  },
  {
   "iface": "awdl0",
   "ip4": "",
   "ip6": "fe80::e4f8:5cff:fee9:f65",
   "mac": "fe:80:00:00:00:00",
   "internal": false
  },
  {
   "iface": "utun0",
   "ip4": "",
   "ip6": "fe80::78b8:e337:511e:ac03",
   "mac": "fe:80:00:00:00:00",
   "internal": false
  },
  {
   "iface": "utun1",
   "ip4": "",
   "ip6": "fe80::3bf2:dba1:bac0:3074",
   "mac": "fe:80:00:00:00:00",
   "internal": false
  }
 ]
}

*/
 