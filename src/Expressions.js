/**
 * Created by josh on 4/20/15.
 */
var Q = require('q');
var utils = require('./utils');
var Literals = require('./Literals');
var Expressions = {
    makeFunctionCall: function(fun,arr,nam) {
        //console.log("Making a function call for",arr,fun);
        return {
            kind:'funcall',
            type:'funcall',
            name:'invoke_',
            arguments: {
                indexed:arr,
                named:nam
            },
            value: function(context) {
                if(fun.type == 'pipeline') {
                    return fun.evaluate(arr[0],arr[1]);
                }
                if(fun.type == 'symbol') {
                    return fun.value(context).then(function(v) {
                        var args = arr.map(function(arg){
                            return arg.value();
                        });
                        return Q.spread(args, v.fun);
                    });
                }
                return Q.fcall(function() {
                    var args = arr.map(function(arg){
                        return arg.value();
                    });
                    return Q.spread(args, fun.fun);
                });
            },
            isFunctionCall: function() {
                return true;
            },
            isPair: function() {
                return false;
            },
            toCode: function() {
                if(fun.type == 'operation') {
                    return '('+arr.map(utils.asCode).join(fun.name)+')';
                }
                return fun.name+'('+arr.map(utils.asCode).join(',')+')';
            }
        }
    },

    makeAssignment: function(symbol, expr) {
        //console.log("making an assignment to ", symbol.kind, 'from',expr.kind);
        return {
            kind:'assignment',
            value: function(context) {
                symbol.update(expr);
                context.register(symbol,expr);
                return symbol.value();
            },
            toCode: function() {
                return symbol.name() + ' <= ' + expr.toCode();
            }
        }
    },

    //pipeline works by evaluating the first arg,
    //then passing the result to the second arg as it's first
    Pipeline: {
        type:'pipeline',
        name:'=>',
        evaluate: function(a,b) {
            return a.value().then(function(val) {
                b.arguments.indexed.unshift(val);
                return b.value().then(function(val2) {
                    return val2;
                });
            });
        },
    }

};

module.exports = Expressions;