/**
 * Created by josh on 4/20/15.
 */


//x <= 5, show that x updates when the expression changes
//x <= 5, y = x*10, show that y updates when x changes
//x <= 4+5, show that x updates when the expression changes
//4+5, implicit symbol % is the result of the expression


function testAssignment1() {
    var x = Symbol.make('x');
    x.update(Literal.makeNumber(5));
    x.onChange(function(symbol) {
        console.log("symbo",symbol.name(),'has changed');
        symbol.value().then(function(value) {
            console.log("the new value is",value);
        });
    });
    x.value().then(function(value,symbol){
        console.log("the before value of ", symbol.name(),"is",value);
    });
    x.update(Literal.makeNumber(6));
    x.value().then(function(value,symbol){
        console.log("the before value of ", symbol.name(),"is",value);
    });
}

function testExpression() {
    //x <= 5
    //y = x+5
    //y = add(x,5)
    var x = Symbol.make('x');
    x.update(Literal.makeNumber(5));
    var y = Symbol.make('y');
    var five = Literal.makeNumber(5);
    var fun = Arithmetic.Add;
    var funcall = Expressions.makeFunctionCall(fun,[x,5],{});
    y.update(funcall);
    y.value().then(function(value,symbol) {
        console.log("the value of ",symbol.name(),'is',value);
        //should be 10
    });
}

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




