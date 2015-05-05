/**
 * Created by josh on 5/5/15.
 */
var Q = require('q');
var csvparse = require('csv-parse');
var fs = require('fs');

function loadCSV(file) {
    console.log("invoking load CSV on file",file);
    return Q.nfcall(fs.readFile,"tests/resources/elements.csv").then(function(buff) {
        return Q.nfcall(csvparse,buff).then(function(rows){
            return rows;
        })
    });
}

var services = {
    loadCSV: loadCSV
};

exports.invoke = function(id, args) {
    console.log("ServiceManager: invoking", id, 'with args',args);
    return services[id].apply(null,args);
};