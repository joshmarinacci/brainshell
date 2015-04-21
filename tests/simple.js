var Q = require('q');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var Symbols = require('../src/Symbols');
var Literals = require('../src/Literals');
var Units = require('../src/Units');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
/**
 * Created by josh on 4/20/15.
 */


//x <= 5, show that x updates when the expression changes
//x <= 5, y = x*10, show that y updates when x changes
//x <= 4+5, show that x updates when the expression changes
//4+5, implicit symbol % is the result of the expression



function testExpressionToString() {
    var four = Literals.makeNumber(4);
    var five = Literals.makeNumber(5);
    var fun = Arithmetic.Add;
    var funcall = Expressions.makeFunctionCall(fun,[four,five],{});
    funcall.value().then(function(value) {
        console.log("value of expression is", value);
    }).done();
    console.log('as code = ',funcall.toCode());
}
testExpressionToString();


function testExpressionUpdate() {
    //x <= 5
    //y = x+5
    //y = add(x,5)
    var x = Symbols.make('x');
    x.update(Literals.makeNumber(5));
    var y = Symbols.make('y');
    var five = Literals.makeNumber(5);
    var fun = Arithmetic.Add;
    var funcall = Expressions.makeFunctionCall(fun,[x,five],{});
    x.value().then(function(v) {
        console.log('x value is ' + v);
    }).done();
    y.value().then(function(v) {
        console.log("y value is ", v);
    }).done();
    y.update(funcall);
    y.value().then(function(v) {
        console.log("the value of y is",v);
        //should be 10
    }).done();

    console.log(y.toCode());
}
testExpressionUpdate();

function testAssignment1() {
    var x = Symbols.make('x');
    x.update(Literals.makeNumber(5));
    x.onChange(function(symbol) {
        symbol.value().then(function(value) {
            console.log("the new value of ",symbol.name(),"is",value);
        });
    });
    x.value().then(function(value){
        console.log("the before value of is",value);
    }).done();
    x.update(Literals.makeNumber(6));
    x.value().then(function(value){
        console.log("the after value of is",value);
    }).done();
}
testAssignment1();


function isEq(v,test,unit) {
    if(v.isNumber()) {
        if(typeof test !== 'number') return false;
        if(v.hasUnit()) {
            if(!Units.equal(v.getUnit(),unit)) return false;
        }
        if(v.getNumber() == test) return true;
        if(Math.abs(v.getNumber()-test) < 0.001) return true;
    }
    return false;
}


function ParseEq(str,value,unit) {
    var out = Parser.matchAll(str,'start');
    out.value().then(function(v) {
        if(!isEq(v,value,unit)) {
            console.log("==== TEST FAILED " + str + " = " + v + " not " + value);
        } else {
            console.log("     TEST PASSED " + str + " = " + v);
        }
    }).done();
}

ParseEq('4+5',9);
ParseEq('4/5',4/5);
ParseEq('4-5',4-5);
ParseEq('4*5',4*5);
ParseEq('(4*5)+5',(4*5)+5);
ParseEq('4+(4*5)+5',4+(4*5)+5);
ParseEq('4.5',4.5);
ParseEq('4_000',4*1000);
ParseEq('4e4',40*1000);
ParseEq('40%',0.40);
ParseEq('40 meters',40,Units.Unit('meter',1));
ParseEq('40 square meters',40,Units.Unit('meter',2));
ParseEq('40 meters as feet',131.233595,Units.Unit('feet',1));

/*
function testIncrementalDataTable() {

    //spit out a new data row every second
    var data = makeDataStream(function(n){
        return n*2;
    },1000);
    data.onChange(function() {
        console.log("data has changed");
        data.length().then(function(len) {
            console.log("new length = ", len);
        });
    });
}

*/


