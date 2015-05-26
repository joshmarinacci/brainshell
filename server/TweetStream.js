/**
 * Created by josh on 5/26/15.
 */
var Twitter = require('twitter');
var util   = require('util');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;

function TwitterStream(query) {
    Readable.call(this,{objectMode:true});
    console.log("searching Twitter for",query);

    var client = new Twitter({
        consumer_key: 'kBYMYDREnztNXwE9YoI7Fawiv',
        consumer_secret: 'iWrNphcP1CX1fAHB3aKvvaJqSR9gWnbYhTUM5nzjmhnMHPsqMN',
        access_token_key: '8559252-okDkKR1Xhzr6f3B9ij439bb5IjOtIWnyl4oyEARwtq',
        access_token_secret: 'wmTGiutT9BezeWHK0JQ6rCXjFiu4i2uzmHnHmIbG7fu9o'
    });

    var params = {screen_name: 'joshmarinacci'};


    this._read = function() {
        //console.log("this is a push stream. _read() is a noop");
    };
    var self = this;
    function connect() {
        client.stream('statuses/filter', {track: query}, function(stream) {
            self.currentStream = stream;
            stream.on('data', function(tweet) {
                //console.log(tweet.text, tweet.user.screen_name);
                self.push({
                    text:tweet.text,
                    screen_name:tweet.user.screen_name
                })
            });

            stream.on('error', function(error) {
                console.log("got an error",error);
                console.log('reconnecting');
                //connect();
                //throw error;
            });
        });
    }
    connect();
    this.stop = function() {
        console.log("stopping the tweet stream");
        if(this.currentStream) {
            console.log('destroying the stream');
            this.currentStream.destroy();
        }
    }
}
util.inherits(TwitterStream, Readable);

var current_stream;
exports.pipe = function(args, stream) {
    current_stream = new TwitterStream(args.query);
    current_stream.pipe(stream);
};
exports.unpipe = function(args, stream) {
    current_stream.unpipe(stream);
    current_stream.stop();
};

