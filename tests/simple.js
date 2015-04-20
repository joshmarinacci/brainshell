var Q = require('q');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var Symbols = require('../src/Symbols');
var Literals = require('../src/Literals');
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


