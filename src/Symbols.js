var Q = require('q');
/**
 * Created by josh on 4/20/15.
 */
var Context = require('../src/Context');

var Symbol = {
    make: function(name) {
        var old = Context.global().lookup(name);
        if(typeof old !== 'undefined') return old;
        return {
            kind:'symbol',
            type:'symbol',
            _name:name,
            name: function() { return this._name; },
            _value:null,
            _cb: function() {
                this.notify();
            },
            update: function(val) {
                this._value = val;
                if(this._value.onChange) {
                    this._value.onChange(this._cb.bind(this));
                }
                this.notify();
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
            value: function(context) {
                if(this._value == null) {
                    return Q.fcall(function() {
                        return null;
                    });
                }
                if(this._value && this._value.kind == 'function') {
                    var fn = this._value;
                    return Q.fcall(function() {
                        return fn;
                    });
                }
                return this._value.value();
            },
            toCode: function() {
                if(this._value == null) return 'null';
                return name +'<=' + this._value.toCode();
            },
            isSymbol: function() {
                return this.type == 'symbol';
            }
        }
    }
};
module.exports = Symbol;