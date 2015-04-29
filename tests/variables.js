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


var simple_sum = Symbols.make("simplesum");
simple_sum.update({
    kind:'function',
    type:'simple',
    name:'simple_sum',
    fun: function() {
        function extractNumber(v) {
            if(v.type == 'numeric') return v._value;
            if(v.type == 'list') {
                var total = 0;
                var it = v.getIterator();
                while(it.hasNext()) {
                    total += extractNumber(it.next());
                }
                return total;
            }
            return 0;
        }

        var total = 0;
        for(var i=0; i<arguments.length;i++) {
            total += extractNumber(arguments[i]);
        }
        return Literals.makeNumber(total);
    }
});
ctx.register(simple_sum);


var complex_sum = Symbols.make("complexsum");
complex_sum.update({
    kind:'function',
    type:'complex',
    name:'complexsum',
    fun: function(arr,nam) {
        function extractNumber(v) {
            if(v.type == 'numeric') return v._value;
            if(v.type == 'list') {
                var total = 0;
                var it = v.getIterator();
                while(it.hasNext()) {
                    total += extractNumber(it.next());
                }
                return total;
            }
            return 0;
        }

        var total = 0;
        for(var i=0; i<arr.length;i++) {
            total += extractNumber(arr[i]);
        }
        for(var name in nam) {
            var val = nam[name];
            total += extractNumber(val);
        }
        return Literals.makeNumber(total);
    }
});
ctx.register(complex_sum);




test("simple func w/ updates", function(t) {
    var sym = Symbols.make('sfff');
    sym.update(Literals.makeNumber(1));
    ctx.register(sym);
    t.plan(2);
    var expr = Parser.matchAll('simplesum(1,sfff,1)','start');
    expr.onChange(function(ex) {
        ex.value(ctx).then(function(v){
            t.equal(v._value,5);
        }).done();
    });
    expr.value(ctx).then(function(v){
        t.equal(v._value,3);
        sym.update(Literals.makeNumber(3));
    }).done();

});

test("indexed and named args w/ updates", function(t){
    var sym = Symbols.make('fff');
    sym.update(Literals.makeNumber(1));
    ctx.register(sym);
    t.plan(2);
    var expr = Parser.matchAll('complexsum(1,fff,[1,1,1],baz:1,foo:fff,bar:1)','start');

    expr.onChange(function(ex) {
        ex.value(ctx).then(function(v){
            t.equal(v._value,12);
        }).done();
    });
    expr.value(ctx).then(function(v){
        t.equal(v._value,8);
        sym.update(Literals.makeNumber(3));
    }).done();
});


function parse(str) {
    return Parser.matchAll(str,'start');
}
