/**
 * Created by josh on 5/26/15.
 */

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
