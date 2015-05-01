/**
 * Created by josh on 5/1/15.
 */
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var Symbols = require('../src/Symbols');
var Literals = require("../src/Literals");
var Units = require('../src/Units')
var Context = require('../src/Context');
var DefaultFunctions = require('../ui/DefaultFunctions');
var test = require('tape');
var ctx = Context.global();

DefaultFunctions.makeDefaultFunctions(ctx);


test("Test RandomWalk",function(t) {
    t.ok(ctx.hasSymbol("RandomWalk"),"symbol exists");
    var out = Parser.matchAll('RandomWalk()','start');
    out.onChange(function(ex) {
        ex.value().then(function(v){
            if(v.length() == 2) {
                t.end();
            }
        }).done();
    });
});


test("Test RunningAverage", function(t) {
    t.ok(ctx.hasSymbol("RunningAverage"), "symbol exists");
    var out = Parser.matchAll('RunningAverage([1,2,3,5])','start');
    out.value(ctx).then(function(v) {
        t.equal(3,v.length(),'correct length');
        t.equal(4,v.item(2).getNumber());
        t.end();
    }).done();
});



test("Test Piped RunningAverage", function(t) {
    var expr = Parser.matchAll('RandomWalk() => RunningAverage()','start');
    var cb = expr.onChange(function(ex) {
        ex.value(ctx).then(function(v) {
            if(v.length() >= 10) {
                expr.removeListener(cb);
                t.end();
            }
        }).done();
    });

});


test("Test TakeFive", function(t) {
    t.ok(ctx.hasSymbol("TakeFive"), "symbol exists");
    var out = Parser.matchAll("TakeFive([0,1,2,3,4,5,6,7,8])","start");
    out.value(ctx).then(function(v) {
        t.equal(v.length(),5);
        t.end();
    }).done();
});

test("Test Piped TakeFive", function(t) {
    var expr = Parser.matchAll('RandomWalk() => TakeFive()','start');
    var cb = expr.onChange(function(ex){
        ex.value(ctx).then(function(v) {
            if(v.length() == 5) {
                expr.removeListener(cb);
                t.end();
                console.log("DONE!");
            }
        }).done();
    });
});