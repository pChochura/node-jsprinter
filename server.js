#!/usr/bin/env node
"use strict";

const logger = require('debug')('jsprinter');
const fs = require('fs');
const path = require('path');
const os = require('os');
//const mmm = require('mmmagic');
//const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
const env = require('process').env;

const config = require('rc')('jsprinter', {
  // ipp printer name
  printerName: 'jsprinter',
  // ipp port
  ippPort: 40023,
  // announce
  zeroconf: false,
  // where to put jobs
  outputPath: 'tmp'
});

logger(config);

// ipp-printer configuration
const printer = new require('ipp-printer')({
  name: config.printerName, port: config.ippPort, zeroconf: config.zeroconf
});

const jobNumberPath = path.join(config.outputPath, '.lastjobno');
try {
  printer._jobId = Number(fs.readFileSync(jobNumberPath));
} catch (e) {
}

// for display
const printer_url = 'http://localhost:' + config.ippPort + '/printers/' +
  config.printerName;

// register incoming job callback
printer.on('job', function (job) {
  console.log('[job %d] Printing document: %s', job)
 
  var filename = 'job-' + job.id + '.pdf'
  var file = fs.createWriteStream(filename)
 
  job.on('end', function () {
    console.log('[job %d] Document saved as %s', job.id, filename)
  })
 
  job.pipe(file)
});

console.log('started printer at ' + printer_url);

// this sucks - clean up/replace - it was copypastad from quicksand's server.js
const http = require('http');
const quicksandConfig = require('rc')('quicksand', {
  port: eval(config.ippPort)+1,
  storeLocation: config.outputPath,
  ageMax: 12*60*60*1000,
  pollFrequency: 5*1000
});
quicksandConfig.ageMax = eval(quicksandConfig.ageMax);
quicksandConfig.port = eval(quicksandConfig.port);
quicksandConfig.pollFrequency = eval(quicksandConfig.pollFrequency);

const Quicksand = new require('quicksand');
const quicksand = new Quicksand(quicksandConfig);
const app = quicksand.app;

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

app.set('port', quicksandConfig.port);
var server = http.createServer(app);
server.listen(quicksandConfig.port);
require('debug')('quicksand:server')('Quicksand started on port ' + quicksandConfig.port);

const process = require('process');
if (process.platform !== 'win32' && (process.getuid() === 0 || process.getgid() === 0)) {
  process.setgid('nogroup');
  process.setuid('nobody');
}

