#!/usr/bin/env node
"use strict";

// TODO: change to remove assumed source - use different sources/parts of app
var debug = require('debug')('jsprinter');
var fs = require('fs'), path = require('path'), os = require('os');
var env = require('process').env;

// joblist
var jobs = [];

// ipp-printer configuration
var Printer = require('ipp-printer');
var printer_conf = {name: 'jsprinter', port: env.IPP_PORT || 40023, zeroconf:
  false};
var printer = new Printer(printer_conf);

// for display
var printer_url = 'http://localhost:' + printer_conf.port + '/printers/' +
                  printer_conf.name;
// TODO: add to about route with app info


// register incoming job callback
printer.on('job', function (job) {
  // TODO: insert debug switch for incoming job printing
  //  console.log(job);

  // TODO: set up temp file write
  //  job.pipe(job.stream);

    // add to joblist
    debug('got job ' + job.id);
    jobs[job.id] = job;
    job.thepath = path.join(os.tmpdir(), '' + Math.random());
    debug('trying to open ' + job.thepath);
    function use_fd(err, fd){
        if (err) {
          console.error("couldn't open thepath");
          return;
        }
        job.fd = fd;
        fs.unlink(job.thepath);
        // still open - important
        var out = fs.createWriteStream(null, {fd: fd, autoClose: false});
        job.pipe(out);

    };
    fs.open(job.thepath, 'w+', use_fd);
});

var express = require('express');
var app = express();

// joblist index route
app.get('/', function (req, res) {
    var response = 'printer is at ' + printer_url + '</br>';
    response += 'jobs:</br><ul>';
    jobs.forEach(function (current) {
        response += '<li><a href=/job/' + current.id + '>';
        response += current.id + ':' + current.name;
        response += '</a> ';
        response += '<a href=/job/' + current.id + '?delete>';
        response += 'forget job';
        response += '</a>';
        response += '</li>';
    });
    response += '</ul>';
    res.send(response);
});

// job access route
app.get('/job/:id', function (req, res) {
    var job = jobs[req.params.id];
    if (job == undefined) {
    res.sendStatus(404);
    return;
    }
    if (req.query.delete !== undefined) {
      debug('deleting job ' + job.id);
      fs.close(job.fd);
      delete jobs[job.id];
      //TODO: delete temp
      res.redirect('back');
      return;
    }
      res.set({
          'Content-Type': 'application/postscript',
          'Content-Disposition': 'inline; filename=' + job.id + '.ps'
      });
      var content = fs.createReadStream(null, {
        start:0, fd: job.fd, autoClose: false});
      content.pipe(res);
      //res.send(job.content);
      return;
    }
);

var joblist_port = env.JOBLIST_PORT || 40024;
app.listen(joblist_port);
console.log('started printer at ' + printer_url);
console.log('started joblist at http://localhost:' + joblist_port);

var process = require('process');
if (process.getuid() === 0 || process.getgid() === 0) {
  process.setgid('nogroup');
  process.setuid('nobody');
}

