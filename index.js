#!/usr/bin/env node
exports.init = function () {}
"use strict";
var Printer = require('ipp-printer');
//var temp = require('temp').track();
var jobs = [];
var printer_conf = {name: 'jsprinter', port: 40023};
var printer_url = 'ipp://localhost:' + printer_conf.port + '/printers/' + printer_conf.name;
var printer = new Printer(printer_conf);
printer.on('job', function (job) {
//    job.stream = temp.createWriteStream();
    jobs.push(job);
//   job.pipe(job.stream);
});
//console.log(printer.server.address().port);

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    if (req.accepts('text/html')) {
        var response = 'printer is at ' + printer_url + '</br>';
        response += 'jobs:</br>';
        jobs.forEach(function (current) {
            response += '<a href=/job/' + current.id + '>';
            response += current.id + ':';
            current.attributes.forEach(function (current) {
                if (current.name === 'job-name') {
                    response += ' ' + current.value;
                }
            });
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
console.log('started with printer at ' + printer_url + ' and joblist at http://localhost:' + joblist_port);
