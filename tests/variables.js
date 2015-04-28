/**
 * Created by josh on 4/27/15.
 */

var Q = require('q');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var Literals = require('../src/Literals');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;

var test = require('tape');


var ctx = Context.global();


test("variable lookup", function(t) {
    t.plan(2);
    var xsym = Symbols.make('x');
    xsym.update(Literals.makeNumber(22));
    ctx.register(xsym);
    var out = Parser.matchAll('x','start');
    t.notEqual(out,null);
    out.value(ctx).then(function(v) {
        t.equal(v._value,22);
    }).done();
});

test("variable math", function(t){
    var xsym = Symbols.make('z');
    xsym.update(Literals.makeNumber(22));
    ctx.register(xsym);
    t.plan(2);
    var out = Parser.matchAll('z+5','start');
    t.notEqual(out,null);
    out.value(ctx).then(function(v) {
        t.equal(v._value,27);
    }).done();
});

test("variable change", function(t) {
    var ysym = Symbols.make('y');
    ysym.update(Literals.makeNumber(1));
    ctx.register(ysym);
    t.plan(2);

    ysym.value(ctx).then(function(v1){
        t.equal(v1._value,1);
        ysym.update(Literals.makeNumber(2));
        ysym.value(ctx).then(function(v2) {
            t.equal(v2._value,2);
        });
    })
});

test("variable update callback", function(t) {
    var ysym = Symbols.make('y2');
    ysym.update(Literals.makeNumber(1));
    ctx.register(ysym);
    t.plan(1);

    ysym.onChange(function(sym) {
        console.log("was updated");
        sym.value(ctx).then(function(v) {
            t.equal(v._value,3);
        });
    });
    ysym.update(Literals.makeNumber(3));
});

test("variable expression update", function(t){
    var asym = Symbols.make('zz');
    asym.update(Literals.makeNumber(1));
    ctx.register(asym);
    t.plan(2);

    var expr = Parser.matchAll('zz+5','start');
    t.notEqual(expr,null);
    expr.onChange(function(sym) {
        sym.value(ctx).then(function(v) {
            t.equal(v._value,8);
        });
    });
    asym.update(Literals.makeNumber(3));

});


test("variable 5+zz+5 parsing", function(t){
    var asym = Symbols.make('foo');
    asym.update(Literals.makeNumber(1));
    ctx.register(asym);
    t.plan(2);

    var expr = Parser.matchAll('5+foo+5','start');
    t.notEqual(expr,null);
    expr.onChange(function(sym) {
        sym.value(ctx).then(function(v) {
            t.equal(v._value,13);
        });
    });
    asym.update(Literals.makeNumber(3));
});
