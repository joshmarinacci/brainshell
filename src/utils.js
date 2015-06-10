/**
 * Created by josh on 4/20/15.
 */

var Q = require('q');
//var WebSocket = require('nodejs-websocket');

//var ServiceManager = require('../server/ServiceManager');

exports.asCode = function asCode(obj) {
    if(obj.type == 'symbol') {
        return obj.name;
    }
    if(!obj.toCode) {
        console.log("WARNING. MISSING toCode on ", obj.toString(), obj);
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


exports.POSTJSON = function(url, data) {
    return Q.promise(function(resolve, reject, notify) {
        var xml = new XMLHttpRequest();
        //console.log("POSTINGting url",url);
        xml.onload = function() {
            if(xml.status == 200) {
                var payload = JSON.parse(xml.responseText);
                resolve(payload);
            } else {
                reject(xml);
            }
        };
        xml.open('POST',url);
        xml.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xml.send(JSON.stringify(data));
    });
};

exports.makeId = function (prefix) {
    return prefix + Math.floor(Math.random()*2*1000*1000*1000);
};

exports.invokeService = function (id, args) {
    if(typeof window === 'undefined') {
        console.log("doing a local invocation");
        return ServiceManager.invoke(id,args);
    }

    return exports.POSTJSON('http://localhost:30045/service/'+id,{
        type:'invoke',
        arguments:args
    });
};

exports.invokeLiveService = function(id, args) {
    return Q.promise(function(resolve, reject, notify) {
        //console.log("invoking a live service", id, args);
        //console.log("qs = ",require('querystring').stringify(args));
        //var url = 'ws:localhost:30046/' + id + '?' + require('querystring').stringify(args);
        console.log("connecting to "+url);
        var conn = WebSocket.connect(url);
        var retobj = {
            cbs:[],
            listen: function (cb) {
                //console.log("listening on a callback");
                this.cbs.push(cb);
            },
            dispatch: function(obj) {
                this.cbs.forEach(function(cb) {
                    cb(obj);
                });
            }
        };
        conn.on('connect', function () {
            console.log("got connected");
        });
        conn.on('text', function (str) {
            //console.log('got a message string', str);
            retobj.dispatch(JSON.parse(str));
        });
        conn.on('close', function () {
            console.log("closed");
        });
        conn.on('error', function () {
            console.log("an error happened");
        });
        resolve(retobj);
    });
};

