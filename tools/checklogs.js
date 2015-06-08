/**
 * Created by josh on 6/5/15.
 */
var fs = require('fs');
var ndjson = require('ndjson');
var stream = fs.createReadStream('log.ndjson');
stream
    .on('error', function(err) {
        console.log(err);
    })
    .pipe(ndjson.parse())
    .on('data', function (row) {
        console.log("row = ",row.state,row);
        if(row.state == 'right-answer') console.log(row.email);
        if(row.state == 'wrong-answer') console.log(row.email);
    })
;
