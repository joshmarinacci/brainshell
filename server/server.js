/**
 * Created by josh on 4/20/15.
 */
var express = require('express');

var app = express();
app.all('*',function(req,res,next) {
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','*');
    res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');

    if ('OPTIONS' == req.method) return res.send(200);

    next();
});

var docs = [
    {
        title:'foo 1',
        id: 'docid_1',
        expressions: [
            {
                type:'code',
                content: '4+5'
            },
            {
                type:'code',
                content:'6+7'
            }
        ]

    },
    {
        title:'foo 2',
        id: 'docid_2',
        expressions: [
            {
                type:'code',
                content:'8*9'
            }
        ]
    }
];

app.get('/josh/docs', function(req,res) {
    res.send(docs);
});


var server = app.listen(30045,function() {
    console.log("lsitening on ", server.address().address);
    console.log("lsitening on ", server.address().port);
})