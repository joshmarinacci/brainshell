var fs       = require('fs');
var Literals = require('../src/Literals');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var utils    = require('../src/utils');
var moment = require('moment');
var Q = require('q');


var DataUtil = {
    is1D: function(data) {
        var first = data._value[0];
        if(first.isNumber()) return true;
        return false;
    },
    is2D: function(data) {
        return !this.is1D(data);
    },
    reduce: function(data, func, initVal, post) {
        var it = data.getIterator();
        var acc = initVal;
        while(it.hasNext()) {
            var row = it.next();
            acc = func(row.getNumber(),acc);
            //console.log("row",row.toString(),acc);
        }
        var val = Literals.makeNumber(acc);
        if(post) return post(data, val);
        return val;
    },
    reduceColumn: function(cinfo, data, func, initVal) {
        //console.log('doing column',cinfo.id());
        var it = data.getIterator();
        var acc = initVal;
        while(it.hasNext()) {
            var row = it.next();
            acc = func(cinfo.getValue(row).getNumber(),acc);
        }
        //console.log("final is",acc);
        return Literals.makeKeyValue(cinfo.id(),Literals.makeNumber(acc));
    },
    reduceAllColumns: function(data, func, initVal, post) {
        var cinfos = data.getColumnInfos();
        var fvals = cinfos.map(function(cinfo) {
            var val = DataUtil.reduceColumn(cinfo,data,func,initVal);
            if(post) return post(data, val, cinfo);
            return val;
        });
        return Literals.makeList(fvals);
    },
    reduceListOrTable: function(data, func, initVal, post) {
        if(DataUtil.is1D(data)) {
            return DataUtil.reduce(data,func, initVal, post);
        }
        if(DataUtil.is2D(data)) {
            return DataUtil.reduceAllColumns(data, func, initVal, post);
        }
    },
    numberArrayToLiteral: function(arr) {
        return Literals.makeList(arr.map(function(v){ return Literals.makeNumber(v)}));
    }
};

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
    init: function() {
        this._cbs=[];
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

    var sym = Symbols.make("PI");
    sym.update(Literals.makeNumber(Math.PI));
    ctx.register(sym);

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
        name: 'Sum',
        cbs: [],
        init: function() {
        },
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
            //console.log("summing data",data);
            var it = data.getIterator();
            var infos = data.getColumnInfos();
            var totals = [];
            for(var i=0; i<infos.length; i++) {
                totals[infos[i].id()] = 0;
            }
            while (it.hasNext()) {
                var v = it.next();
                for(var i=0; i<infos.length; i++) {
                    totals[infos[i].id()] += infos[i].getValue(v).getNumber();
                }
            }
            if(totals.length == 1) {
                return Literals.makeNumber(totals[0]);
            }
            var arr = totals.map(function(v) {
                return Literals.makeNumber(v);
            });
            return Literals.makeList(arr);
        }
    });

    regSimple(ctx, {
        name: 'Mean',
        cbs: [],
        init: function() {
        },
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
            var infos = data.getColumnInfos();
            function calcMean(info) {
                var it = data.getIterator();
                var total = 0;
                var count = 0;
                while(it.hasNext()) {
                    count++;
                    var v = it.next();
                    total += info.getValue(v).getNumber();
                }
                return Literals.makeNumber(total/count);
            }
            var totals = infos.map(calcMean);
            if(totals.length == 1) {
                return totals[0];
            }
            return Literals.makeList(totals);
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
        fun: function(data,num) {
            var count = 5;
            if(num) {
                //console.log("the number we should take is",num);
                //count = num.getNumber();
            }
            var it = data.getIterator();
            var vals = [];
            while (it.hasNext()) {
                vals.push(it.next());
                if(vals.length > count) {
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
            obj.data = data;
            obj.type = 'schart';
            return obj;
        }
    }));

    regSimple(ctx, Extendo(BaseValue,{
        name:'MakeList',
        init: function() {
            this._cbs=[];
        },
        fun: function(num) {
            var n = num.getNumber();
            var arr = [];
            for(var i=0; i<n; i++) {
                arr.push(Literals.makeNumber(i+1));
            }
            return Literals.makeList(arr);
        }
    }));

    regSimple(ctx, Extendo(BaseValue,{
        name:'Take',
        init: function() {
            this._cbs=[];
        },
        fun: function(data,Bnum) {
            var num = Bnum.getNumber();
            if(num < 0) {
                var arr = it2Array(data.getIterator());
                arr = arr.slice(arr.length + num);
                return Literals.makeList(arr);
            }
            if(num > 0) {
                var arr = it2Array(data.getIterator());
                arr = arr.slice(0,num);
                return Literals.makeList(arr);

            }
            // if num is 0
            return Literals.makeList([]);
        }
    }));

    regSimple(ctx, Extendo(BaseValue, {
        name:"Elements",
        init: function() {
            this._cbs=[];
        },
        fun: function() {
            return utils.invokeService("loadCSV",["tests/resources/elements.csv"]).then(function(rows) {
                return Literals.makeList(rows.map(function(row) {
                    return Literals.makeList(row.map(function(col) {
                        return Literals.makeString(col);
                    }));
                }));
            });
        }
    }));

    regSimple(ctx, Extendo(BaseValue, {
        name:"StockHistory",
        init: function() {
            this._cbs=[];
        },
        fun: function() {
            return utils.invokeService("StockHistory",["AAPL"]).then(function(rows) {
                return Literals.makeList(rows.map(function(row) {
                    var vals = [];
                    for(var name in row) {
                        vals.push(Literals.makeKeyValue(name,Literals.makeString(row[name])));
                    }
                    return Literals.makeList(vals);
                }));
            });
        }
    }));

    regSimple(ctx, Extendo(BaseValue, {
        name:"EarthquakeHistory",
        init: function() {
            this._cbs=[];
        },
        fun: function() {
            return utils.invokeService("EarthquakeHistory").then(function(rows) {
                return Literals.makeList(rows.map(function(row) {
                    var vals = [];
                    for(var name in row) {
                        vals.push(Literals.makeKeyValue(name,Literals.makeString(row[name])));
                    }
                    return Literals.makeList(vals);
                }));
            });
        }
    }));

    regSimple(ctx, Extendo(BaseValue, {
        name:"Min",
        MinFunc: function(a,b) {
            return Math.min(a,b)
        },
        fun: function(data) {
            return DataUtil.reduceListOrTable(data, this.MinFunc, Number.MAX_VALUE);
        }
    }));
    regSimple(ctx, Extendo(BaseValue, {
        name:"Max",
        MaxFunc:function(a,b) {
            return Math.max(a,b);
        },
        fun: function(data) {
            return DataUtil.reduceListOrTable(data, this.MaxFunc, -Number.MAX_VALUE);
        }
    }));
    regSimple(ctx, Extendo(BaseValue, {
        name:"Mean",
        SumFunc: function(a,b) {
            return a+b;
        },
        fun: function(data) {
            return DataUtil.reduceListOrTable(data, this.SumFunc, 0, function (data, val, cinfo) {
                if (cinfo) {
                    //console.log(val.getValue().toString());
                    var nval = Literals.makeNumber(val.getValue().getNumber() / data.length());
                    return Literals.makeKeyValue(val.getKey(), nval);
                }
                return Literals.makeNumber(val.getNumber() / data.length());
            });
        }
    }));
    regSimple(ctx, Extendo(BaseValue, {
        name: "Unique",
        UniqueFunc:function(a,b) {
            b[a] = a;
            return b;
        },
        fun: function(data) {
            return DataUtil.reduceListOrTable(data, this.UniqueFunc, {}, function(data,val,cinfo) {
                return Literals.makeList(Object.keys(val._value).map(function(key) {
                    return Literals.makeNumber(val._value[key]);
                }));
            });
        }
    }));
    regSimple(ctx, Extendo(BaseValue, {
        name: "Histogram",
        fun: function (list, bucketCount) {
            var bc = 10;
            if (typeof bucketCount !== 'undefined') bc = bucketCount.getNumber();
            //var min = Min(list).getNumber();
            var min = 0;
            //var max = Max(list).getNumber();
            var max = 10;
            var buckets = [];
            //this is a hack. not sure how to fix it
            for (var i = 0; i < bc + 1; i++) {
                buckets[i] = 0;
            }
            function valToBucketIndex(val) {
                return Math.floor((val - min) / (max - min) * bc);
            }

            var it = list.getIterator();
            while (it.hasNext()) {
                var val = it.next();
                var n = valToBucketIndex(val.getNumber());
                buckets[n]++;
            }
            return DataUtil.numberArrayToLiteral(buckets);
        }
    }));


};


function it2Array(it) {
    var arr = [];
    while(it.hasNext()) {
        arr.push(it.next());
    }
    return arr;
}