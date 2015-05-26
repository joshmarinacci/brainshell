/**
 * Created by josh on 5/26/15.
 */

var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var test = require('tape');
var Context = require('../src/Context');
var DefaultFunctions = require('../ui/DefaultFunctions');
var ctx = Context.global();
DefaultFunctions.makeDefaultFunctions(ctx);

test('tweet stream',function(t){
    var expr = Parser.matchAll("TweetStream('#arduino')",'start');
    expr.onChange(function(){
        console.log("expression has updated");
        expr.value(ctx).then(function(list) {
            console.log("list length = ", list.length());
        }).done();
    });
    expr.value(ctx).then(function(list){
        console.log("got results",list);
        t.end();
    }).done();
});


/*
var WebSocket = require('nodejs-websocket');
//connect to the twitter stream

var conn = WebSocket.connect('ws:localhost:30046/TweetStream?query=android');
conn.on('connect',function(){
    console.log("got connected");
});
conn.on('text',function(str){
    console.log('got a message string',str);
});
conn.on('close',function(){
    console.log("closed");
});
conn.on('error',function() {
    console.log("an error happened");
});
*/