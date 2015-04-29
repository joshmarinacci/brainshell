var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var Literals = require('../src/Literals');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var ctx = Context.global();
var test = require('tape');
var DF = require('../ui/DefaultFunctions');
DF.makeDefaultFunctions(ctx);

/**
 * Created by josh on 4/28/15.
 */

//ctx.dump();
function parse(str) {
    return Parser.matchAll(str,'start');
}

test("parse compound list", function(t){
    t.plan(3);
    var listText = "[[first:'bob', last:'smith', birthdate:'10-03-75'], [first:'sally', last:'stokes', birthdate:'11-04-76']]";
    parse(listText).value().then(function(v) {
        t.equal(v.type,'list');
        t.equal(v.isList(),true);
        t.equal(v._value.length,2);
    });
});

test("setColumnFormat", function(t) {
    t.plan(3);
    var listText = "[[first:'bob', last:'smith', birthdate:'10-03-1975'], [first:'sally', last:'stokes', birthdate:'11-04-76']]";
    parse("setColumnFormat("+listText+",'birthdate',type:'date',parsePattern:'MM-DD-YYYY')").value().then(function(v) {
        var infos = v.getColumnInfos();
        var name_col = infos[0];
        var first_col = infos[2];
        var it = v.getIterator();
        var first_row = it.next();

        t.equal(name_col.getValue(first_row)._value,'bob');

        var date  = first_col.getValue(first_row);
        t.equal(date.isValid(),true);
        t.equal(date.year(),1975);
        //console.log(date.toISOString(), date.year());
    }).done();
});


//generate lists
test("RangeList", function(t) {
    t.plan(3);
    parse("RangeList(10)").value().then(function(v) { t.equal(v.length(),10);  }).done();
    parse("RangeList(5,10)").value().then(function(v) { t.equal(v.length(),5);  }).done();
    parse("RangeList(5,10,2)").value().then(function(v) { t.equal(v.length(),3);  }).done();
});