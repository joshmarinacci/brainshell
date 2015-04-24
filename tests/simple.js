var Q = require('q');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var Symbols = require('../src/Symbols');
var Literals = require('../src/Literals');
var Units = require('../src/Units');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var Context = require('../src/Context');
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
//testExpressionToString();


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
//testExpressionUpdate();

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
//testAssignment1();


function isEq(v,test,unit) {
    if(v.isFunctionCall()) {
        v.value().then(function(v) {
            //console.log("resolved value = ",v.toString());
            //console.log("equal = ",isEq(v,test));
        });
        return true;
    }
    if(v.isNumber()) {
        if(typeof test !== 'number') return false;
        if(v.hasUnit()) {
            if(!Units.equal(v.getUnit(),unit)) return false;
        }
        if(v.getNumber() == test) return true;
        if(Math.abs(v.getNumber()-test) < 0.001) return true;
    }
    if(v.isString()) {
        if(typeof test !== 'string') return false;
        if(v.getString() == test) return true;
    }
    if(v.isList()) {
        //console.log("checking a list",v.length(),test.length);
        if(test.length && v.length() != test.length) return false;
        //console.log("testing");
        v.forEach(function(value,index){
            //console.log("value = ", value.toString(), "index = ", index);//,test[index]);
            if(value.isPair()) {
                //console.log("this is a pair ", value.getKey());
                //console.log("has prop",test.hasOwnProperty(value.getKey()));
                if(!test.hasOwnProperty(value.getKey())) {
                    console.log("prop names don't match");
                    return false;
                }
                var val = test[value.getKey()];
                var matches =  isEq(value.getValue(),val);
                if(!matches) {
                    console.log("pair value doesnt match!");
                }
            } else {
                if (!isEq(value, test[index])) {
                    console.log("invalid");
                }
            }
        });
        return true;
    }
    return false;
}


function ParseEq(str,value,unit, ctx) {
    var out = Parser.matchAll(str,'start');
    out.value(ctx).then(function(v) {
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

//string literals
ParseEq('"foo"',"foo");
ParseEq("'foo'","foo");

ParseEq("[1,2,3]",[1,2,3]);
ParseEq("[4]",[4]);
ParseEq('[ 4 , 6.7]',[4,6.7]);
ParseEq('[4+5]',[9]);
ParseEq('[4+5,6.7]',[9,6.7]);

ParseEq('[foo:5]',{foo:5});
ParseEq("[x:1,y:2]",{x:1,y:2});
ParseEq('[foo:4+5]',{foo:9});


ParseEq('[ [0,1,2], [3,4,5], [6,7,8] ]',[[0,1,2],[3,4,5],[6,7,8]]);
ParseEq('[ [x:1,y:2], [x:3,y:4], [x:5,y:6] ]',[{x:1,y:2},{x:3,y:4},{x:5,y:6}]);


var dofun = {
    kind:'function',
    type:'simple',
    name:'dofun',
    fun: function() {
        return Literals.makeNumber(6);
    }
};

var ctx = Context;
ctx.register(Symbols.make('dofun'),dofun);
ParseEq('dofun()',6, null, ctx);

var makelist = {
    kind:'function',
    type:'simple',
    name:'makeList',
    fun: function() {
        return Literals.makeList([Literals.makeNumber(1),Literals.makeNumber(2)]);
    }
};
ctx.register(Symbols.make('makeList'),makelist);
ParseEq('makeList()',[1,2],null, ctx);

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


