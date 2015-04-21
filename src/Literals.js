var Q = require('q');
/**
 * Created by josh on 4/20/15.
 */

var Literal = {
    makeNumber: function(jsnum, unit) {
        return {
            kind:'literal',
            type:'numeric',
            _unit: unit,
            _value: jsnum,
            value: function() {
                var self = this;
                return Q.fcall(function() {
                    return self;
                });
            },
            toCode: function() {
                return this.toString();
            },
            isNumber: function() {
                return this.type == 'numeric';
            },
            getNumber: function() {
                return this._value;
            },
            hasUnit: function() {
                return (typeof this._unit !== 'undefined');
            },
            getUnit: function() {
                return this._unit;
            },
            toString: function() {
                var us = "";
                if(this._unit) {
                    us = ' ' + this._unit.toString();
                }
                return 'LITERAL ' + this._value + us;
            }
        }
    }
};

module.exports = Literal;