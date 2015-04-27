var Q = require('q');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var Literals = require('../src/Literals');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;

/**
 * Created by josh on 4/27/15.
 */
var ctx = Context.global();

var xsym = Symbols.make('x');
xsym.update(Literals.makeNumber(22));
ctx.register(xsym);


function testVariableLookkup() {
    var out = Parser.matchAll('x','start');
    out.value(ctx).then(function(v) {
        console.log("the final value is ",v.toCode());
    }).done();

}
function testVariableMath() {
    var out = Parser.matchAll('x+5','start');
    out.value(ctx).then(function(v) {
        console.log("the final value is ",v.toCode());
    }).done();

}

testVariableLookkup();
testVariableMath();
