var test = require('tape');
var Literals = require("../src/Literals");
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var DefaultFunctions = require('../ui/DefaultFunctions');
var Context = require('../src/Context');
var Symbols = require('../src/Symbols');
var moment  = require('moment');
var DataUtil = require('../src/DataUtil');
var ctx = Context.global();


function complex(ind,nam) {
    var total = 0;
    ind.forEach(function(val) {
        total += val.getNumber();
    });

    Object.keys(nam).forEach(function(key) {
        var val = nam[key];
        total += val.getNumber();
    });
    return Literals.makeNumber(total);
}
var complex_sym = Symbols.make('complex');
complex_sym.update({
    kind:'function',
    type:'complex',
    fun: complex
});
ctx.register(complex_sym);


test('complex func with no args', function(t) {
    Parser.matchAll("complex()",'start').value(ctx).then(function(v) {
        t.equal(v.getNumber(),0,'complex()');
        t.end();
    }).done();
});

test('complex func with indexed args', function(t) {
    var str = "complex(1,2,3)";
    Parser.matchAll(str,'start').value(ctx).then(function(v) {
        t.equal(v.getNumber(),6,str);
        t.end();
    }).done();
});

test('complex func with named args', function(t) {
    var str = "complex(foo:1,bar:2,baz:3)";
    Parser.matchAll(str,'start').value(ctx).then(function(v) {
        t.equal(v.getNumber(),6,str);
        t.end();
    }).done();
});