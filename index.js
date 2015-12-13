#!/usr/bin/env node
exports.init = function () {}
"use strict";

// track chained makes temp cleanup at shutdown
//var temp = require('temp').track();

// joblist
var jobs = [];

// ipp-printer configuration
var Printer = require('ipp-printer');
var printer_conf = {name: 'jsprinter', port: 40023};
var printer = new Printer(printer_conf);

// for display
var printer_url = 'http://localhost:' + printer_conf.port + '/printers/' +
                  printer_conf.name;

// register incoming job callback
printer.on('job', function (job) {
  // TODO: insert debug switch for incoming job printing
  //  console.log(job);

  // TODO: maybe switch to wrapper object to cache detected file type.
  //       alternative is to check every time we need to know, but don't know
  //       how that would interact with it getting shunted to a temp file.
  //       maybe would replace job object with temp file handle object with only
  //       display information stored in memory. not sure how to keep job object
  //       and empty buffer.

  // TODO: set up temp file write
  //  job.stream = temp.createWriteStream();
  //  job.pipe(job.stream);

    // add to joblist
    jobs.push(job);
});

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    if (req.accepts('text/html')) {
        var response = 'printer is at ' + printer_url + '</br>';
        response += 'jobs:</br>';
        jobs.forEach(function (current) {
            response += '<a href=/job/' + current.id + '>';
            response += current.id + ':' + current.name;
            response += '</a></br>';
        });
        res.send(response);
    } else {
        res.status(500).send('Not Implemented Yet');
    }
});

app.get('/job/:id', function (req, res) {
    var job = jobs.find(function (element) {
        if (element.id === parseInt(req.params.id)) {return true; }
        return false;
    });
    if (job !== undefined) {
        res.set({
            'Content-Type': 'application/postscript',
            'Content-Disposition': 'inline; filename=' + job.id + '.ps'
        });
        job.pipe(res);
        return;
    }
    res.sendStatus(404);
});

var joblist_port = 40024;
app.listen(joblist_port);
console.log('started printer at ' + printer_url);
console.log('started joblist at http://localhost:' + joblist_port);
