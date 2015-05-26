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
                connect();
                //throw error;
            });
        });
    }
    connect();
}
util.inherits(TwitterStream, Readable);

exports.pipe = function(args, stream) {
    //console.log('opening a twitter stream. args =  ',args);
    new TwitterStream(args.query).pipe(stream);
};


/*function() {
        console.log("generating a twitter stream");
        return Q.promise(function(resolve, reject, notify) {
            resolve([{username:'alice', text:'yo'}, {username:'bob', text:'sup'}]);
        });
    }
}*/


/*



new TwitterStream("#android").pipe(new LogStream());

*/

