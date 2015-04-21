var Literals = require('./Literals');
/**
 * Created by josh on 4/20/15.
 */
var Arithmetic = {
    Add: {
        type:'operation',
        name:'+',
        fun: function(a,b) {
            return Literals.makeNumber(a._value+b._value);
        }
    },
    Multiply: {
        type:'operation',
        name:'*',
        fun: function(a,b) {
            return Literals.makeNumber(a._value*b._value);
        }
    },
    Subtract: {
        type:'operation',
        name:'*',
        fun: function(a,b) {
            return Literals.makeNumber(a._value-b._value);
        }
    },
    Divide: {
        type:'operation',
        name:'*',
        fun: function(a,b) {
            return Literals.makeNumber(a._value/b._value);
        }
    }
};

module.exports = Arithmetic;
