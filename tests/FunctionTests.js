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


test("Sum of list", function(t) {
    Parser.matchAll("MakeList(10) => Sum()",'start').value(ctx).then(function(v){
        console.log("final value is",v.toString());
        t.equal(v.getNumber(),55);
        t.end();
    }).done();
});

test("Test Mean", function(t) {
    t.ok(ctx.hasSymbol("Mean"), "symbol exists");
    Parser.matchAll('Mean([1,2,3,4,5,6,7,8,9,10])','start').value(ctx).then(function(v) {
        console.log("result = ", v.toString());
        t.equal(v.getNumber(),55/10);
        t.end();
    }).done();
});

test("Test Take", function(t) {
    t.ok(ctx.hasSymbol("Take"), "symbol exists");
    Parser.matchAll('Take([1,2,3,4,5,6,7,8,9,10],3)','start').value(ctx).then(function(v) {
        t.equal(v.length(),3);
        t.equal(v.item(0).getNumber(),1);
        t.equal(v.item(2).getNumber(),3);
    }).done();
    Parser.matchAll('Take([1,2,3,4,5,6,7,8,9,10],-4)','start').value(ctx).then(function(v) {
        t.equal(v.length(),4);
        t.equal(v.item(0).getNumber(),7);
        t.equal(v.item(3).getNumber(),10);
    }).done();

    Parser.matchAll('MakeList(5) => Take(-2)','start').value(ctx).then(function(v) {
        t.equal(v.length(),2);
        t.equal(v.item(0).getNumber(),4);
        t.equal(v.item(1).getNumber(),5);
        t.end();
    }).done();
});

test("Test Elements", function(t) {
    t.ok(ctx.hasSymbol("Elements"), "symbol exists");
    var exp = Parser.matchAll('Elements()','start');
    exp.value(ctx).then(function(v) {
        t.equal(v.length(),118);
        t.equal(v.item(0).length(),4);
        var num = v.item(0).item(0);
        var weight = v.item(0).item(1);
        var name = v.item(0).item(2);
        t.equal(num.isString(),true);
        t.equal(weight.isString(),true);
        t.equal(name.isString(),true);
        t.equal(name.getString(),"Hydrogen");
        t.equal(v.item(108).item(2).getString(),'Meitnerium');
        t.end();
    }).done();
});

test("Test StockHistory", function(t) {
    t.ok(ctx.hasSymbol("StockHistory"), "symbol exists");
    var exp = Parser.matchAll("StockHistory('AAPL')",'start');
    exp.value(ctx).then(function(v) {
        console.log("got back value", v.length());
        var l = v.length();
        var last = v.item(l-1);
        console.log("last = ", last);
    });
});

return;


test("Test RandomWalk",function(t) {
    t.ok(ctx.hasSymbol("RandomWalk"),"symbol exists");
    var expr = Parser.matchAll('RandomWalk()','start');
    var cb = expr.onChange(function(ex) {
        ex.value().then(function(v){
            if(v.length() == 2) {
                expr.removeListener(cb);
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



test("Test Take Update", function(t) {
    var expr1 = Parser.matchAll('RandomWalk() => Take(3)','start');
    var count = 0;
    var cb = expr1.onChange(function(ex){
        ex.value(ctx).then(function(v){
            t.equal(v.length(),3);
            count++;
            if(count == 3) {
                expr1.removeListener(cb);
                t.end();
            }
        });
    });
});

test("Test Make List", function(t) {
    var expr1 = Parser.matchAll('MakeList(10)','start');
    expr1.value(ctx).then(function(v){
        t.equal(v.length(),10);
        t.equal(v.item(0),1);
    });
    var expr2 = Parser.matchAll('MakeList(10, start:5','start');
    expr2.value(ctx).then(function(v){
        t.equal(v.length(),10);
        t.equal(v.item(0),5);
        t.equal(v.item(1),6);
    });
    var expr3 = Parser.matchAll('MakeList(10, start:5, step:2','start');
    expr3.value(ctx).then(function(v){
        t.equal(v.length(),10);
        t.equal(v.item(0),5);
        t.equal(v.item(1),7);
        t.end();
    });
});
