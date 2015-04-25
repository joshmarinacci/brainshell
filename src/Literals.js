var Q = require('q');
var util = require('util');
/**
 * Created by josh on 4/20/15.
 */

function LiteralBase() {
    this.value = function() {
        var self = this;
        return Q.fcall(function() {
            return self;
        });
    };
    this.isNumber = function() {
        return this.type == 'numeric';
    };
    this.isString = function() {
        return this.type == 'string';
    };
    this.isList = function() {
        return this.type == 'list';
    };
    this.isFunctionCall = function() {
        return this.kind == 'funcall';
    };
    this.isPair = function() {
        return this.type == 'pair';
    }
}

function NumberLiteral(num,unit) {
    LiteralBase.call(this);
    this.kind = 'literal';
    this.type = 'numeric';
    this._unit = unit;
    this._value = num;
    this.toCode = function() {
        var us = "";
        if(this._unit) {
            us = ' ' + this._unit.toString();
        }
        return this._value + us;
    };
    this.getNumber = function() {
        return this._value;
    };
    this.hasUnit = function() {
        return (typeof this._unit !== 'undefined');
    };
    this.getUnit = function() {
        return this._unit;
    };
    this.toString = function() {
        var us = "";
        if(this._unit) {
            us = ' ' + this._unit.toString();
        }
        return 'LITERAL ' + this._value + us;
    }
}
util.inherits(NumberLiteral, LiteralBase);

function StringLiteral(str) {
    LiteralBase.call(this);
    this.kind = 'literal';
    this.type = 'string';
    this._value = str;
    this.getString = function() {
        return this._value;
    };
    this.toString = function() {
        return 'LITERAL ' + this._value;
    };
    this.toCode = function() {
        return "'"+this._value+"'";
    }
}
util.inherits(StringLiteral, LiteralBase);




function ArrayIterator(data) {
    this.index = 0;
    this.hasNext = function() {
        return (this.index < data.length);
    };
    this.next = function() {
        var row = data[this.index];
        this.index++;
        return row;
    }
}



function ListLiteral(list) {
    LiteralBase.call(this);
    this.kind = 'literal';
    this.type = 'list';
    this._value = list;
    this.update = function(list) {
        this._value = list;
        this.notify();
    };
    this.cbs =[];
    this.onChange = function(cb) {
        this.cbs.push(cb);
    };
    this.notify = function() {
        var self = this;
        this.cbs.forEach(function(cb) {
            cb(self);
        });
    };

    this.toString = function() {
        return 'LITERAL LIST' + this._value;
    };
    this.length = function() {
        return this._value.length;
    };
    this.forEach = function(cb) {
        this._value.forEach(cb);
    } ;

    this.item = function(index) {
        return this._value[index];
    };

    this.itemByKey = function(key) {
        for(var i=0; i<this._value.length; i++) {
            var pair = this._value[i];
            if(pair.getKey() == key) return pair.getValue();
        }
        return this._value[0]._value;
    };

    this.toString = function() {
        return 'LITERAL LIST [' + this._value + ']';
    };

    this.toCode = function() {
        return 'code [' + this._value.map(function(v) { return v.toCode(); }).join(',') + ']';
    };

    //get iterator
    this.getIterator = function() {
        return new ArrayIterator(this._value);
    },
    //get column info
    this.getColumnInfos = function() {
        if(this._value.length <= 0) return [];
        var infos = [];
        var first = this._value[0];
        if(first.isNumber()) {
            return [{
                id:function() { return 0; },
                title: function() { return this.id()+""; },
                type: function() { return 'number'; },
                getValue: function(row) { return row; },
                print: function(row) { return this.getValue(row).toCode(); }
            }];
        }
        if(first.isList()) {
            first._value.map(function(datum) {
                if(datum.type == 'pair') {
                    var key = datum._key;
                    var value = datum._value;
                    infos.push({
                        id: function() { return key; },
                        title: function() { return this.id(); },
                        type: function() { return value.type; },
                        getValue: function(row) { return row.itemByKey(key); },
                        print: function(row) { return this.getValue(row).toCode(); }
                    });
                }
            })
        }
        return infos;
    }
}
util.inherits(ListLiteral, LiteralBase);

function KeyValuePair(key,value) {
    LiteralBase.call(this);
    this.type = 'pair';
    this._key = key;
    this._value = value;
    this.toString = function() {
        return 'KVP [' + this._key + ":"+this._value+']';
    };
    this.getKey = function() {
        return this._key;
    };
    this.getValue = function() {
        return this._value;
    },
    this.toCode = function() {
        return this._key + ':' + this._value;
    }
}
util.inherits(KeyValuePair, LiteralBase);


var Literal = {
    makeNumber: function(jsnum, unit) {
        return new NumberLiteral(jsnum,unit);
    },
    makeString: function(jsstr) {
        return new StringLiteral(jsstr);
    },
    makeList: function(jsarr) {
        return new ListLiteral(jsarr);
    },
    makeKeyValue: function(key,value) {
        return new KeyValuePair(key,value);
    }
};

module.exports = Literal;