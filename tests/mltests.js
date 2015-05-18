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
var Symbols = require('../src/Symbols');
var moment  = require('moment');
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


//var data = NDJSON(‘events.json’,100);
test('load ND JSON data', function(t) {
    var str = "NDJSON('events.json',20000)";
    Parser.matchAll(str, 'start').value(ctx).then(function(v) {
        var count = 0;
        var it = v.getIterator();
        var cinfos = v.getColumnInfos();
        var tsinfo = cinfos.filter(function(cinfo) { return cinfo.id() == 'Timestamp'})[0];
        while(it.hasNext()) {
            var val = it.next();
            //console.log('timestamp = ',tsinfo.getValue(val));
            count++;
        }
        console.log('final count = ', count);
        t.equal(count,20000);
        t.end();
    }).done();
});

//var startDate = Date(month:4, day:1) // may 1st
test('date create', function(t) {
    var str = "Date(month:3, day:1)";
    Parser.matchAll(str, 'start').value(ctx).then(function(v){
        t.equal(v.type,'date','type is date');
        t.equal(v.getDate().month(),3,'month is april/3');
        t.end();
    }).done();
});

//var endDate = Date(month:’may’, day:10) // may 10th
test('date create 2', function(t) {
    var str = "Date(month:'june', day:19)";
    Parser.matchAll(str, 'start').value(ctx).then(function(v){
        t.equal(v.type,'date','type is date');
        t.equal(v.getDate().month(),5,'month is june/3');
        t.end();
    }).done();
});



test('set column format for timestamps', function(t) {
    //var str = "[ Date(month:'june', day:19), Date(month:'june', day:20), Date(month:'june', day:21) ]";
    var str = "setColumnFormat([ [ts:'1429041449644', event:1], [ts:'1429041449645', event:2], [ts:'1429042668312', event:3], [ts:'1431898583000',event:4] ], 'ts', type:'date', parsePattern:'x')";
    Parser.matchAll(str, 'start').value(ctx).then(function(v){
        //t.equal(v.length(),3);
        var it = v.getIterator();
        //var cis = v.getColumnInfos();
        while(it.hasNext()) {
            var row = it.next();
            //console.log("row = ", row.toString());
            //cis.forEach(function(ci) {
            //    console.log("column ", ci.title(), '=', ci.print(row));
            //});
        }
        t.end();
    }).done();
});

//
function makeTimestampData(count,month, date, hour, minute) {
    var rows = [];
    for(var i=0; i<count; i++) {
        var mom = moment();
        mom.date(i*date);
        mom.month(i*month);
        mom.hour(i*hour);
        mom.minute(i*minute);
        //console.log("moment = ", mom.toString());
        var row = Literals.makeList([
            Literals.makeKeyValue('timestamp',Literals.makeDate(mom)),
            Literals.makeKeyValue('event',Literals.makeNumber(i))
        ]);
        rows.push(row);
    }
    return rows;
}

//var d2 = FilterByDateRange(data,column:’timestamp’,start:startDate, end:endDate) // filter by timestamp column
test('filter by date range', function(t) {
    var sym = Symbols.make('data');
    sym.update(Literals.makeList(makeTimestampData(100,0,0,0,1)));
    ctx.register(sym);
    var str = "FilterByDateRange(data, 'timestamp', start:Date(month:'may', day:3), end:Date(month:'may', day:7) )";
    Parser.matchAll(str, 'start').value(ctx).then(function(v){
        var it = v.getIterator();
        var cis = v.getColumnInfos();
        while(it.hasNext()) {
            var row = it.next();
            //console.log("row = ", row.toString());
            cis.forEach(function(ci) {
                //console.log("column ", ci.title(), '=', ci.print(row));
            });
        }
        t.end();
    }).done();
});

test('function in list literal', function(t) {
    var str = "[9, 4+5, Sum([4,5])]";
    Parser.matchAll(str, 'start').value(ctx).then(function(v) {
        //console.log("v = ", v.toString());
        t.equal(v.length(),3);
        t.equal(v.item(0).getNumber(),9);
        t.equal(v.item(1).getNumber(),9);
        t.equal(v.item(2).getNumber(),9);
        t.end();
    });
});
/*
// BucketByDateTime(data, column:'timestamp', by:'weekday')
test('BucketByDatetime', function(t) {
    var sym = Symbols.make('data');
    sym.update(Literals.makeList(makeTimestampData(100,0,0,1,0)));
    ctx.register(sym);
    var str = "BucketByDateTime(data, column:'timestamp', by:'weekday')";
    Parser.matchAll(str, 'start').value(ctx).then(function(v){
        console.log("got output count",v.toString());
        var it = v.getIterator();
        while(it.hasNext()) {
            var val = it.next();
            console.log('val = ', val.toString());
        }
        t.end();
    }).done();
});
*/


//TChart(d2, xaxis:’timestamp’) // charts into 1 hour buckets

//var d3 = Unique(d2,column:’Publisher’)
//list of unique values
//var d4 = SplitUnique(d2,column:’Publisher’)
//TChart(d4, xid:’timestamp’) // makes three charts into 1 hour buckets

