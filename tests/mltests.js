/**
 * Created by josh on 5/14/15.
 * @return {number}
 */

var test = require('tape');
var Literals = require("../src/Literals");

//summary of table, runs summary on each column, prints max,min, mean,median
//-max of list
//-max of table
//-min of list
//-min of table
//-mean of list
//-mean of table
//summary of list
//summary of table
//NDJSON filename, only loads first 100
//parse March 5th as a partial date
//FilterByDateRange(data, 'column name', from: March 5th to: March 9th)
//-Unique(list)
//Unique(table,'column name')
//--SplitUnique(table, 'column name')
//Histogram(table)


/**
 * @return {number}
 */
function MinFunc(a,b) {
    return Math.min(a,b)
}
/**
 * @return {number}
 */
function MaxFunc(a,b) {
    return Math.max(a,b)
}

function SumFunc(a,b) {
    return a+b;
}

var DataUtil = {
    is1D: function(data) {
        var first = data._value[0];
        if(first.isNumber()) return true;
        return false;
    },
    is2D: function(data) {
        return !this.is1D(data);
    },
    reduce: function(data, func, initVal, post) {
        var it = data.getIterator();
        var acc = initVal;
        while(it.hasNext()) {
            var row = it.next();
            acc = func(row.getNumber(),acc);
            //console.log("row",row.toString(),acc);
        }
        var val = Literals.makeNumber(acc);
        if(post) return post(data, val);
        return val;
    },
    reduceColumn: function(cinfo, data, func, initVal) {
        //console.log('doing column',cinfo.id());
        var it = data.getIterator();
        var acc = initVal;
        while(it.hasNext()) {
            var row = it.next();
            acc = func(cinfo.getValue(row).getNumber(),acc);
        }
        //console.log("final is",acc);
        return Literals.makeKeyValue(cinfo.id(),Literals.makeNumber(acc));
    },
    reduceAllColumns: function(data, func, initVal, post) {
        var cinfos = data.getColumnInfos();
        var fvals = cinfos.map(function(cinfo) {
            var val = DataUtil.reduceColumn(cinfo,data,func,initVal);
            if(post) return post(data, val, cinfo);
            return val;
        });
        return Literals.makeList(fvals);
    },
    reduceListOrTable: function(data, func, initVal, post) {
        if(DataUtil.is1D(data)) {
            return DataUtil.reduce(data,func, initVal, post);
        }
        if(DataUtil.is2D(data)) {
            return DataUtil.reduceAllColumns(data, func, initVal, post);
        }
    }
};

function Min(data) {
    return DataUtil.reduceListOrTable(data, MinFunc, Number.MAX_VALUE);
}
function Max(data) {
    return DataUtil.reduceListOrTable(data, MaxFunc, -Number.MAX_VALUE);
}
function Mean(data) {
    return DataUtil.reduceListOrTable(data, SumFunc, 0, function(data,val,cinfo) {
        if(cinfo) {
            //console.log(val.getValue().toString());
            var nval = Literals.makeNumber(val.getValue().getNumber()/data.length());
            return Literals.makeKeyValue(val.getKey(), nval);
        }
        return Literals.makeNumber(val.getNumber()/data.length());
    });
}

function UniqueFunc(a,b) {
    b[a] = a;
    return b;
}

function Unique(data) {
    return DataUtil.reduceListOrTable(data, UniqueFunc, {}, function(data,val,cinfo) {
        return Literals.makeList(Object.keys(val._value).map(function(key) {
            return Literals.makeNumber(val._value[key]);
        }));
    });
}


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


test('list functions', function(t) {
    t.equal(Min(makeList(0,10)).getNumber(),0,'min');
    t.equal(Max(makeList(0,10)).getNumber(),10,'max');
    t.equal(Mean(makeList(0,10)).getNumber(),5,'mean');
    t.end();
});

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


test('unique functions', function(t) {
    var list = Literals.makeList([1,2,3,2,1,3,2,3,2].map(function(v){ return Literals.makeNumber(v); }));
    var l_uniq = Unique(list);
    t.equal(l_uniq.length(),3,'list');
    t.end();
});

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

