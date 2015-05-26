var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var Symbols = require('../src/Symbols');
var Literals = require("../src/Literals");
var Units = require('../src/Units')
var Context = require('../src/Context');
var DataUtil = require('../src/DataUtil');
var DefaultFunctions = require('../ui/DefaultFunctions');
var test = require('tape');
var ctx = Context.global();

DefaultFunctions.makeDefaultFunctions(ctx);

/*Parser.matchAll("StockHistory('NNOK')",'start').value(ctx).then(function(v){
    runTests();
});
*/
function runTests() {
    test("dates after 1997", function (t) {
        //Parser.matchAll("StockHistory('NNOK') => setColumnFormat('Date', type:'date') => FilterByDateRange('Date', start: Date(month:'May', date:22))",'start').value(ctx).then(function(v){
        Parser.matchAll("StockHistory('NNOK') "
            + "=> setColumnFormat('Date', type:'date') "
            + "=> FilterByDateRange('Date', start:Date(year: 2000))", 'start').value(ctx).then(function (v) {
            var arr = DataUtil.listToJSArray(v);
            console.log("array length =", arr.length);
            t.end();
        }).done();
    });
    test("dates before 1997", function (t) {
        //Parser.matchAll("StockHistory('NNOK') => setColumnFormat('Date', type:'date') => FilterByDateRange('Date', start: Date(month:'May', date:22))",'start').value(ctx).then(function(v){
        Parser.matchAll("StockHistory('NNOK') "
            + "=> setColumnFormat('Date', type:'date') "
            + "=> FilterByDateRange('Date', end:Date(year:2000))", 'start').value(ctx).then(function (v) {
            var arr = DataUtil.listToJSArray(v);
            console.log("array length =", arr.length);
            t.end();
        }).done();
    });
    test("dates between 1997 and 1998", function (t) {
        //Parser.matchAll("StockHistory('NNOK') => setColumnFormat('Date', type:'date') => FilterByDateRange('Date', start: Date(month:'May', date:22))",'start').value(ctx).then(function(v){
        Parser.matchAll("StockHistory('NNOK') "
            + "=> setColumnFormat('Date', type:'date') "
            + "=> FilterByDateRange('Date', start:Date(year:1997), end:Date(year:1998))", 'start').value(ctx).then(function (v) {
            var arr = DataUtil.listToJSArray(v);
            console.log("array length =", arr.length);
            t.end();
        }).done();
    });
}
function p(str,cb) {
    return Parser.matchAll(str,'start').value(ctx).then(cb).done();
}

function RandomTests() {
    test('Random', function(t) {
        p("Random()",function(v) {
            t.isEqual(DataUtil.isNumber(v),true,'got back a number');
            t.end();
        });
    });
    test('Random(10)', function(t) {
        p("Random(10)",function(v) {
            t.isEqual(DataUtil.isList(v),true,'got back a list');
            t.isEqual(DataUtil.listLength(v),10,'len 10');
            t.end();
        })
    });
    test('Random(min:10,max:20)', function(t) {
        p("Random(min:10,max:20)",function(v) {
            t.end();
        });
    });
    test('Accumulate', function(t) {
        p("Accumulate([1,2,3])", function (v) {
            t.isEqual(DataUtil.isList(v),true,'got back a list');
            t.isEqual(DataUtil.listLength(v),2,'correct length');
            t.isEqual(v.item(0).getNumber(),3,'list[0] == 3');
            t.isEqual(v.item(1).getNumber(),6,'list[1] == 6');
            t.end();
        });
    });

}
//RandomTests();

function ListUpdateTests() {
    var sym = Symbols.make('UpdateFunc');
    sym.update({
        kind:'function',
        type:'simple',
        dataUpdate:true,
        fun: function() {
            console.log("inside UpdateFunc");
            var items = [Literals.makeNumber(99)];
            var list = Literals.makeList(items);
            var count = 0;
            setInterval(function(){
                //console.log("triggering an update");
                count++;
                items.push(Literals.makeNumber(count));
                list.update(items);
            },1000);
            return list;
        }
    });
    ctx.register(sym);
    function doit() {
        var expr = Parser.matchAll("UpdateFunc()", 'start');
        expr.onChange(function () {
            //console.log("the expression changed",expr);
            expr.value(ctx).then(function (v) {
                console.log("new value is", v.length());
            })
        });
        expr.value(ctx).then(function (v) {
            console.log("result is ", v.length());
        }).done();
    }
    doit();
    setTimeout(doit,3500);
}
ListUpdateTests();