/**
 * Created by josh on 5/14/15.
 * @return {number}
 */

var test = require('tape');
var Literals = require("../src/Literals");
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var DefaultFunctions = require('../ui/DefaultFunctions');
var Context = require('../src/Context');
var ctx = Context.global();

DefaultFunctions.makeDefaultFunctions(ctx);

/*

summary of table, runs summary on each column, prints max,min, mean,median
-max of list
-max of table
-min of list
-min of table
-mean of list
-mean of table
summary of list
summary of table
NDJSON filename, only loads first 100
parse March 5th as a partial date
FilterByDateRange(data, 'column name', from: March 5th to: March 9th)
-Unique(list)
Unique(table,'column name')
-SplitUnique(table, 'column name')
Histogram(list, bucketcount)
-Histogram(table, bucketcount,'column name')

*/


/*
function makeList(min,max) {
    var arr = [];
    for(var i=min; i<=max; i++) {
        arr.push(Literals.makeNumber(i));
    }
    return Literals.makeList(arr);
}
function makeTable(count, def) {
    var arr = [];
    var cvals = {};
    for(var i=0; i<=count; i++) {
        var row = [];
        def.forEach(function(col){
            var key = col[0];
            if(!cvals.hasOwnProperty(key)) {
                cvals[key] = col[1];
            } else {
                cvals[key] += col[2];
            }
            //console.log("col",key,col[1],col[2]);
            row.push(Literals.makeKeyValue(key,Literals.makeNumber(cvals[key])));
        });
        arr.push(Literals.makeList(row));
    }
    //console.log(cvals);
    return Literals.makeList(arr);
}
*/
function testExpressionToNumber(str,correct,msg) {
    test(msg, function(t){
        var expr = Parser.matchAll(str,'start');
        expr.value(ctx).then(function(v) {
            t.equal(v.getNumber(),correct,msg);
            t.end();
        }).done();
    });
}

testExpressionToNumber("MakeList(10) => Min()",1,'Min(1->10)');
testExpressionToNumber("MakeList(10) => Max()",10,'Max(1->10)');
testExpressionToNumber("MakeList(9) => Mean()",5,'Max(1->9)');

/*
test('table functions', function(t){
    var table = makeTable(10,[['a',0,-1], ['b',0,5]]);
    t.equal(Min(table).itemByKey('a').getNumber(),-10,'min');
    t.equal(Min(table).itemByKey('b').getNumber(),0,'min');
    t.equal(Max(table).itemByKey('a').getNumber(),0,'max');
    t.equal(Max(table).itemByKey('b').getNumber(),50,'max');
    t.equal(Mean(table).itemByKey('a').getNumber(),-5,'mean');
    t.equal(Mean(table).itemByKey('b').getNumber(),25,'mean');
    t.end();
});
*/

test('Unique(list)', function(t) {
    var expr = Parser.matchAll("Unique([1,2,3,2,1,3,2,3,2])",'start');
    expr.value(ctx).then(function(v) {
        t.equal(v.length(),3,'Unique(list)');
        t.end();
    });
});


/*

function objectTableToLiteral(js) {
    return Literals.makeList(js.map(function(row) {
        return Literals.makeList(Object.keys(row).map(function(col) {
            return Literals.makeKeyValue(col, Literals.makeString(row[col]));
        }));
    }));
}

function SplitUnique(table, tcol) {
    var outputs = {};
    for(var i=0; i<table.length(); i++) {
        var row = table.item(i);
        var col = row.itemByKey(tcol);
        var key = col.getString();
        if(!outputs.hasOwnProperty(key)) {
            outputs[key] = Literals.makeList([]);
        }
        outputs[key]._value.push(row);
    }
    return Literals.makeList(Object.keys(outputs).map(function(key) {
        var value = outputs[key];
        return Literals.makeKeyValue(key, value);
    }));
}

test('split unique', function(t) {
    var jstable = [
        {a:'foo',b:'boo'},
        {a:'far',b:'bar'},
        {a:'faz',b:'baz'},
        {a:'foo',b:'booz'},
        {a:'far',b:'barz'},
        {a:'faz',b:'bazz'},
        {a:'far',b:'bars'},
    ];
    var table = objectTableToLiteral(jstable);
    var tables = SplitUnique(table,'a');
    t.equal(tables.length(),3);
    var table0 = tables.itemByKey('foo');
    t.equal(table0.length(),2);
    var table1 = tables.itemByKey('far');
    t.equal(table1.length(),3);
    var table2 = tables.itemByKey('faz');
    t.equal(table2.length(),2);
    t.end();
});



function numberArrayToLiteral(arr) {
    return Literals.makeList(arr.map(function(v){ return Literals.makeNumber(v)}));
}

function stringChartList(list) {
    var it = list.getIterator();
    while(it.hasNext()) {
        var val = it.next().getNumber();
        var str = "";
        for(var i=0; i<val; i++) {
            str += '#';
        }
        console.log(str);
    }
}


*/

test('histogram list', function(t){
    var str = "Histogram([5,7,1,6,6,6,7,7,2,3,4,3,7,8,5,8,7,9,6,8,5,6,5,2,4,0,7,4,8,5,7,6,3,8,8,8,4,8],5)";
    Parser.matchAll(str,'start').value(ctx).then(function(v) {
        //console.log("the value is",v.toString());
        t.equal(v.item(1).getNumber(),5,"correct bucket value");
        t.end();
    }).done();
});
/*
test('histogram table', function(t){
    var str = "Histogram([ [x:1, y:2], [x:1, y:3], [x:2, y:4] ],5,'x')";
    Parser.matchAll(str,'start').value(ctx).then(function(v) {
        console.log("the value is",v.toString());
        t.equal(v.item(1).getNumber(),5,"correct bucket value");
        t.end();
    }).done();
});
*/