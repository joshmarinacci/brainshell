/**
 * Created by josh on 4/27/15.
 */
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var test = require('tape');
var ctx = Context.global();


test("multiple blocks", function(t) {
    t.plan(2);
    var expr = Parser.matchAll('4+4;5+5','start');
    t.notEqual(expr,null);
    expr.value(ctx).then(function(v) {
        t.equal(v._value,10);
    }).done();
});


