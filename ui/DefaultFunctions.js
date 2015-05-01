var Literals = require('../src/Literals');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var moment = require('moment');

function regSimple(ctx,fun) {
    fun.kind = "function";
    fun.type = "simple";
    if(fun.init) fun.init();
    var sym = Symbols.make(fun.name);
    sym.update(fun);
    ctx.register(sym);
}

var BaseValue = {
    onChange: function(cb) {
        //console.log("added a listener",this.name,this._cbs.length);
        this._cbs.push(cb);
        return cb;
    },
    removeListener: function(cb) {
        var n = this._cbs.indexOf(cb);
        if(n >= 0)  this._cbs.splice(n,1);
    },
    notify: function () {
        //console.log("notifying:",this.name, this._cbs.length);
        var self = this;
        this._cbs.forEach(function (cb) {
            cb(self);
        });
    }
};

function Extendo(base,addons) {
    var obj = Object.create(base);
    for(var name in addons) {
        obj[name] = addons[name];
    }
    return obj;
}

exports.makeDefaultFunctions = function(ctx) {

    regSimple(ctx,{
        name:'setColumnFormat',
        fun: function(data, columnArg, typeArg, parseArg, patternArg) {
            var column = columnArg._value;
            //console.log('column is',column);
            var type = typeArg._value._value;
            //console.log('type is ',type);
            if(parseArg._key !== 'parsePattern') {
                throw new Error("parse pattern is missing");
            }
            var parsePattern = parseArg._value._value;
            //console.log(parsePattern);

            function StdColumnInfo(id,type) {
                this.id = function() {
                    return id;
                };
                this.title = function() {
                    return this.id();
                };
                this.type = function() {
                    return type;
                };

                this.getValue = function(row) {
                    return row[this.id()];
                };

                this.print = function(row) {
                    return ""+this.getValue(row);
                };
            }

            function setColumnFormat(list, key, options) {
                this.type = 'list-wrapper';
                this.getIterator = function() {
                    return list.getIterator();
                };
                this.getColumnInfos = function() {
                    var infos = list.getColumnInfos();
                    var index = 0;
                    for(var i=0; i<infos.length; i++) {
                        if(infos[i].id() == key) {
                            index = i;
                            break;
                        }
                    }
                    var newInfo = new StdColumnInfo(key,options.type);
                    if(options.type == 'number') {
                        newInfo.getValue = function (row) {
                            return parseFloat(row[this.id()]);
                        };
                    }
                    if(options.type == 'date') {
                        newInfo.getValue = function(row) {
                            return  moment(row.itemByKey(this.id()), options.parsePattern);
                        };
                        newInfo.print = function(row) {
                            return this.getValue(row).format(options.printPattern);
                        };
                    }
                    if(options.unit) {
                        newInfo.print = function (row) {
                            return this.getValue(row) + ' ' + options.unit;
                        };
                    }
                    infos[index] = newInfo;
                    return infos;
                }
            }
            return new setColumnFormat(data, column,
                {
                    type:type,
                    parsePattern:parsePattern,
                    printPattern: 'MMMM DD, YYYY'
                });
        }
    });

    regSimple(ctx, {
        name: 'sum',
        cbs: [],
        onChange: function (cb) {
            this.cbs.push(cb);
        },
        notify: function () {
            var self = this;
            this.cbs.forEach(function (cb) {
                cb(self);
            });
        },
        fun: function (data) {
            var it = data.getIterator();
            var total = 0;
            while (it.hasNext()) {
                var v = it.next();
                total += v._value;
            }
            return Literals.makeNumber(total);
        }
    });


    regSimple(ctx, Extendo(BaseValue,{
        name:'RandomWalk',
        list:[],
        init: function(){
            this._cbs=[];
            this.items = [];
            this.list = Literals.makeList(this.items);
            this.num = 0;
            setInterval(this.appendNumber.bind(this),1000);
        },
        appendNumber: function() {
            this.num += (Math.random()*10)-5;
            this.items.push(Literals.makeNumber(this.num));
            this.list.update(this.items);
            this.notify();
        },
        fun: function (data) {
            return this.list;
        }
    }));

    regSimple(ctx, Extendo(BaseValue,{
        name:'RunningAverage',
        init: function() {
            this._cbs=[];
        },
        fun: function(data) {
            var it = data.getIterator();
            var vals = [];
            var prev = null;
            while (it.hasNext()) {
                var v = it.next();
                if (prev != null) {
                    vals.push(Literals.makeNumber((v._value + prev._value) / 2));
                }
                prev = v;
            }
            return Literals.makeList(vals);
        }
    }));

    regSimple(ctx, {
        name:"TakeFive",
        init: function() {
            this._cbs=[];
        },
        fun: function(data) {
            var it = data.getIterator();
            var vals = [];
            while (it.hasNext()) {
                vals.push(it.next());
                if(vals.length > 5) {
                    vals.shift();
                };
            };
            return Literals.makeList(vals);
        }
    });

    regSimple(ctx, Extendo(BaseValue,{
        name:'SChart',
        init: function() {
            this._cbs=[];
        },
        fun: function(data) {
            var obj = Literals.makeEmpty();
            obj.type = 'schart';
            return obj;
        }
    }));
};
