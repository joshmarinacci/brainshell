/**
 * Created by josh on 4/20/15.
 */


var ServiceManager = require('./ServiceManager');
var DB = require('./database');
DB.initDB();

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('ui'));
app.use(express.static('node_modules'));

app.all('*',function(req,res,next) {
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','*');
    res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');

    if ('OPTIONS' == req.method) return res.send(200);

    next();
});

app.get('/josh/docs', function(req,res) {
    DB.getAllDocs(function(docs){
        res.send(docs);
    });
});

app.get ('/josh/docs/:id', function(req,res) {
    DB.loadDoc(req.params.id, function(doc) {
        res.send(doc);
    })
});
app.post('/josh/docs/:id', function(req,res) {
    console.log("got a post");
    console.log(req.body);
    DB.saveDoc(req.body, function(resp) {
        res.send({status:'success'});
    });
});

app.post('/josh/createdoc', function(req,res) {
    console.log("making a new doc");
    DB.newDoc(req.body,function(resp) {
        res.send(resp);
    });
});

app.post('/josh/forkdoc', function(req,res) {
    DB.forkDoc(req.body,function(resp) {
        res.send(resp);
    });
});

app.post('/josh/deletedoc', function(req,res) {
    console.log("got a post");
    console.log(req.body);
    DB.deleteDoc(req.body, function(resp) {
        res.send({status:'success'});
    });
});


app.post('/service/:id',function(req,res) {
    ServiceManager.invoke(req.params.id, req.body.arguments)
        .then(function(result) {
            res.send(result);
        }).fail(function(err) {
            console.log("an error happened");
            res.send({status:'error'});
        }).done();
});


var server = app.listen(30045,function() {
    console.log("listening on ", server.address().address);
    console.log("listening on ", server.address().port);
});