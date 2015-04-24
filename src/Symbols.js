var Q = require('q');
/**
 * Created by josh on 4/20/15.
 */

var Symbol = {
    make: function(name) {
        return {
            kind:'symbol',
            type:'symbol',
            _name:name,
            name: function() { return this._name; },
            _value:null,
            update: function(val) {
                this._value = val;
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
                if(context) {
                    var val = context.lookup(this);
                    if(val) {
                        if(!val.value) {
                            return Q.fcall(function() {
                                return val;
                            })
                        }
                    }
                }
                if(this._value == null) {
                    return Q.fcall(function() {
                        return null;
                    });
                }
                return this._value.value();
            },
            toCode: function() {
                return name +'<=' + this._value.toCode();
            },
            isSymbol: function() {
                return this.type == 'symbol';
            }
        }
    }
};
module.exports = Symbol;