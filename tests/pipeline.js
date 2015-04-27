var Q = require('q');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var Literals = require('../src/Literals');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;

/**
 * Created by josh on 4/26/15.
 */


var ctx = Context.global();

var makeList = {
    kind:'function',
    type:'simple',
    name:'makeList',
    value: function() {
        var self = this;
        return Q.fcall(function() {
            return self;
        });
    },
    fun: function() {
        var arr = [1,2,3,4];
        return Literals.makeList(arr.map(function(n) {
            return Literals.makeNumber(n);
        }));
    }
};
var makeList_sym = Symbols.make('makeList');
makeList_sym.update(makeList);
ctx.register(makeList_sym);

var sum = {
    kind: 'function',
    type:'simple',
    name:'sum',
    value: function() {
        var self = this;
        return Q.fcall(function() {
            return self;
        });
    },
    fun: function(data) {
        var it = data.getIterator();
        var total = 0;
        while(it.hasNext()) {
            var v = it.next();
            total += v._value;
        }
        return Literals.makeNumber(total);
    }
};
var sum_sym = Symbols.make('sum');
sum_sym.update(sum);
ctx.register(sum_sym);

function testPipeline() {
    var out = Parser.matchAll('makeList() => sum()','start');
    out.value(ctx).then(function(v) {
        console.log("the final value is ",v.toCode());
        //ctx.dump();
    }).done();

}
testPipeline();
