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

Parser.matchAll("StockHistory('NNOK')",'start').value(ctx).then(function(v){
    runTests();
});
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
