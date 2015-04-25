/**
 * Created by josh on 4/21/15.
 */
var Q = require('q');
var Datastore = require('nedb');


var db;


var DB = {
    initDB: function() {
        db = new Datastore({
            filename:"./library.db",
            autoload:true
        });
        console.log("database initialized");
    },

    populateDB:function() {
        var docs = [
            {
                title:'foo 1',
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
                expressions: [
                    {
                        type:'code',
                        content:'8*9'
                    }
                ]
            }
        ];

        docs.forEach(function(doc){
            db.insert(doc);
        });

    },
    printContents: function() {
        db.find({}).exec(function(err,docs){
            console.log(err);
            console.log(docs);
        });
    },
    getAllDocs: function(cb) {
        db.find({}).exec(function(err,docs){
            if(err) throw err;
            console.log(docs);
            cb(docs);
        });
    },

    saveDoc: function(doc, cb) {
        db.update({id:doc.id},doc,{},function(err,num){
            console.log("updated ",num);
            cb();
        });
    },

    newDoc: function(body, cb) {
        db.insert({title:'new doc', expressions:[ { type:'code', content:'1+2*3'}]},function(err,doc){
            console.log("the new doc is",doc);
            cb(doc);
        })
    }
};


module.exports = DB;

//DB.initDB();
//DB.populateDB();
//DB.printContents();

