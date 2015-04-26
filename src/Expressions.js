/**
 * Created by josh on 4/20/15.
 */
var Q = require('q');
var utils = require('./utils');
var Expressions = {
    makeFunctionCall: function(fun,arr,nam) {
        //console.log("Making a function call for",arr,fun);
        return {
            kind:'funcall',
            value: function(context) {
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
    }
};

module.exports = Expressions;