/**
 * Created by josh on 4/20/15.
 */
var Q = require('q');
var utils = require('./utils');
var Literals = require('./Literals');
var Expressions = {
    makeFunctionCall: function(fun,arr,nam) {
        //console.log("Making a function call for",arr,fun);
        var fcall = {
            kind:'funcall',
            type:'funcall',
            name:'invoke_',
            arguments: {
                indexed:arr,
                named:nam
            },
            cbs:[],
            init: function() {
                var cb = this.dependentUpdated.bind(this);
                arr.forEach(function(arg) {
                    if(!arg.onChange) return;
                    arg.onChange(cb);
                });
                if(fun.onChange) fun.onChange(cb);
            },
            dependentUpdated: function() {
                this.notify();
            },
            onChange: function(cb) {
                this.cbs.push(cb);
            },
            notify: function() {
                var self = this;
                this.cbs.forEach(function(cb) {
                    cb(self);
                });
            },
            value: function(context) {
                var self = this;
                if(fun.type == 'pipeline') {
                    return fun.evaluate(arr[0],arr[1]);
                }
                if(fun.type == 'symbol') {
                    return fun.value(context).then(function(v) {
                        if(v==null) {
                            console.log("WARNING. SYMBOL resolved to null");
                            return null;
                        }
                        if(v.type == 'complex') {
                            return self.invokeComplex(v);
                        }
                        if(v.type == 'simple') {
                            return self.invokeSimple(v);
                        }
                        throw Error('unknown function type',v.type);
                    });
                }
                return Q.fcall(function() {
                    var args = arr.map(function(arg){
                        return arg.value();
                    });
                    return Q.spread(args, fun.fun.bind(fun));
                });
            },
            invokeSimple: function(v) {
                var args = arr.map(function(arg){
                    return arg.value();
                });
                return Q.spread(args, v.fun.bind(v));
            },
            invokeComplex: function(v) {
                var args = arr.map(function(arg) {
                    if(arg.type == 'pair') {
                        return arg._value.value();
                    }
                    return arg.value();
                });
                return Q.all(args).then(function(values) {
                    var indexed = [];
                    var named = {};
                    for(var i=0; i<arr.length; i++) {
                        var val = values[i];
                        var arg = arr[i];
                        if(arg.type == 'pair') {
                            named[arg._key] = val;
                        } else {
                            indexed.push(val);
                        }
                    }
                    return v.fun(indexed,named);
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
        fcall.init();
        return fcall;
    },

    makeAssignment: function(symbol, expr) {
        //console.log("making an assignment to ", symbol.kind, 'from',expr.kind);
        var fcall = {
            kind:'assignment',
            init: function() {
                var cb = this.dependentUpdated.bind(this);
                //arr.forEach(function(arg) {
                //    if(!arg.onChange) return;
                //    arg.onChange(cb);
                //});
                if(expr.onChange) expr.onChange(cb);
            },
            cbs:[],
            onChange: function(cb) {
                this.cbs.push(cb);
            },
            notify: function() {
                var self = this;
                this.cbs.forEach(function(cb) {
                    cb(self);
                });
            },
            dependentUpdated: function() {
                this.notify();
            },
            value: function(context) {
                symbol.update(expr);
                context.register(symbol,expr);
                return symbol.value();
            },
            toCode: function() {
                return symbol.name() + ' <= ' + expr.toCode();
            }
        };
        fcall.init();
        return fcall;
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
        }
    }

};

module.exports = Expressions;