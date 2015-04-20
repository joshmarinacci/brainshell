var Q = require('q');
/**
 * Created by josh on 4/20/15.
 */

var Symbol = {
    make: function(name) {
        return {
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
            value: function() {
                if(this._value == null) {
                    return Q.fcall(function() {
                        return null;
                    });
                }
                return this._value.value();
            },
            toCode: function() {
                return name +'<=' + this._value.toCode();
            }
        }
    }
};
module.exports = Symbol;