/**
 * Created by josh on 5/5/15.
 */
var Q = require('q');
var request = require('request');
var csvparse = require('csv-parse');
var csv = require("csv-streamify");
var fs = require('fs');
var es = require("event-stream");
var moment = require('moment');
var JSONStream = require("JSONStream");
var ndjson = require('ndjson')

function loadCSV(file) {
    console.log("invoking load CSV on file",file);
    return Q.nfcall(fs.readFile,"tests/resources/elements.csv").then(function(buff) {
        return Q.nfcall(csvparse,buff).then(function(rows){
            return rows;
        })
    });
}

var JStream = function (cb) {
    this.writable = true;
    this.arr = [];
    this.write = function(d) {
        //console.log('got write data',d);
        this.arr.push(d);
    }
    this.end = function() {
        for(var i=0; i<Math.min(10,this.arr.length); i++) {
            //console.log(this.arr[i]);
        }
        if(cb) cb(this.arr);
    }
}
require('util').inherits(JStream, require('stream'));
function StockHistory(query) {
    return Q.promise(function(resolve, reject, notify) {
        try {
            var req = request("http://real-chart.finance.yahoo.com/table.csv?s=" + query + "&d=9&e=8&f=2015&g=d&a=0&b=3&c=1994&ignore=.csv");
            req.on('error', function () {
                console.log("got an error");
            });
            req.on('response', function (res) {
                res
                    .pipe(csv({objectMode: true, columns: true}))
                    .pipe(es.mapSync(function (d) {
                        d.Date = moment(d.Date).toJSON();
                        d.Open = parseFloat(d.Open);
                        d.High = parseFloat(d.High);
                        d.Low = parseFloat(d.Low);
                        d.Close = parseFloat(d.Close);
                        d.Volume = parseInt(d.Volume);
                        d['Adj Close'] = parseFloat(d['Adj Close']);
                        return d;
                    }))
                    .pipe(new JStream(resolve))
                ;
            })
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
}

function EarthquakeHistory() {
    return Q.promise(function(resolve, reject, notify) {
        try {
            var req = request("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson");
            req.on('error', function () {
                console.log("got an error");
            });
            req.on('response', function (res) {
                res
                    .pipe(JSONStream.parse("features.*"))
                    .pipe(es.mapSync(function (data) {
                        //console.log('row',data);
                        //reformat the data to include just what we want
                        return {
                            mag: data.properties.mag,
                            id: data.id,
                            place: data.properties.place,
                            time: data.properties.time,
                            type: data.properties.type,
                            magType: data.properties.magType,
                            geometry_coordinates: data.geometry.coordinates,
                            geometry_type: data.geometry.type
                        }
                    }))
                    .pipe(new JStream(resolve))
                ;

            })
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
}


function NDJSON(filenameArg,len) {
    return Q.promise(function(resolve, reject, notify) {
        if(!filenameArg || filenameArg == null) return reject(new Error('missing argument filename'));
        var filename = "events.json";
        var count = 100;
        if(len && len.type == 'numeric') {
            count = len._value;
        }
        try {
            var stream = fs.createReadStream(filename);
            var data = [];
            var going = true;
            stream
                .on('error', function(err) {
                    reject(err);
                })
                .pipe(ndjson.parse())
                .on('data', function (row) {
                    if (!going) return;
                    count--;
                    data.push(row);
                    if (count <= 0) {
                        resolve(data);
                        going = false;
                        stream.close();
                    }
                })
            ;
        } catch (err) {
            reject(err);
        }
    });
}

var services = {
    loadCSV: loadCSV,
    StockHistory: StockHistory,
    EarthquakeHistory: EarthquakeHistory,
    NDJSON: NDJSON
};

exports.invoke = function(id, args) {
    if(!services[id]) return new Q.fcall(function(){
        console.log("doing an error");
        throw new Error("unknown service " + id);
    });
    return services[id].apply(null,args);
};