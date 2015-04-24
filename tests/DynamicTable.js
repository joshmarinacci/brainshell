var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var Expressions = require('../src/Expressions');
var Literals = require('../src/Literals');
var ctx = Context;

/**
 * Created by josh on 4/24/15.
 */
var makeList = {
    kind:'function',
    type:'simple',
    name:'makeList',
    fun: function() {
        var items = [Literals.makeNumber(1),Literals.makeNumber(2)];
        var list = Literals.makeList(items);
        setInterval(function(){
            items.push(Literals.makeNumber(3));
            list.update(items);
        },1000);
        return list;
    }
};
var makeListSymbol = Symbols.make('makeList');
ctx.register(makeListSymbol,makeList);
var funcall = Expressions.makeFunctionCall(ctx.lookup(makeListSymbol),[],{});
var sym = Symbols.make("funcall");
sym.update(funcall);
sym.value().then(function(value) {
    console.log("value of expression is", value.length());
    value.onChange(function(v) {
        console.log("changed",v.length());
    });
}).done();

