/**
 * Created by josh on 4/20/15.
 */

var Q = require('q');


exports.asCode = function asCode(obj) {
    if(obj.type == 'symbol') {
        return obj.name();
    }
    return obj.toCode();
};



exports.GETJSON = function(url) {
    return Q.Promise(function(resolve, reject, notify) {
        var xml = new XMLHttpRequest();
        //console.log("GETting url",url);
        xml.onload = function() {
            if(xml.status == 200) {
                var payload = JSON.parse(xml.responseText);
                resolve(payload);
            } else {
                reject(xml.status);
            }
        };
        xml.open('GET',url);
        xml.send();
    });
};


