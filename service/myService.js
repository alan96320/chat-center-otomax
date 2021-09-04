const Windows = require('node-windows');
var fs = require('fs');
const path = require('path');
const Service = Windows.Service;

var dir = path.join(path.dirname(__dirname), 'streaming.js');

var svc = new Service({
    name:'IMCenter Ototmax',
    description: 'Created By Cep Alan Suhendar',
    script: dir,
});

// ambil status service
const statusService = async () => {
    return svc.exists;
}

// install Service
const install = async () => {
    svc.on('install',function(){
        svc.start();
        console.log('Servie installer success');
    });
    svc.install();
}

const uninstall = async () => {
    svc.stop();
    svc.uninstall();
    svc.on('uninstall',function(){
        console.log('Uninstall complete.');
        console.log('The service exists: ',svc.exists);
    });
}

module.exports = {install,uninstall,statusService}

  
