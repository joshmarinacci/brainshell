var fs       = require('fs');
var Literals = require('../src/Literals');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var utils    = require('../src/utils');
var moment = require('moment');
var Q = require('q');
var DataUtil = require('../src/DataUtil');
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

function MinFunc(a,b) {  return Math.min(a,b);  }
function MaxFunc(a,b) {  return Math.max(a,b);  }
function SumFunc(a,b) {  return a+b;            }

function Min(data)  { return DataUtil.reduceListOrTable(data, MinFunc, Number.MAX_VALUE); };
function Max(data)  { return DataUtil.reduceListOrTable(data, MaxFunc, -Number.MAX_VALUE); }
function Sum(data)  { return DataUtil.reduceListOrTable(data, SumFunc, 0); }
function Mean(data) {
    return DataUtil.reduceListOrTable(data, SumFunc, 0, function (data, val, cinfo) {
        if (cinfo) {
            var nval = Literals.makeNumber(val.getValue().getNumber() / data.length());
            return Literals.makeKeyValue(val.getKey(), nval);
        }
        return Literals.makeNumber(val.getNumber() / data.length());
    });
}
function UniqueFunc(a,b) {
    b[a] = a;
    return b;
}
function Unique(data) {
    return DataUtil.reduceListOrTable(data, UniqueFunc, {}, function(data,val,cinfo) {
        return Literals.makeList(Object.keys(val._value).map(function(key) {
            return Literals.makeNumber(val._value[key]);
        }));
    });
}

function Histogram(list, bucketCount) {
    var bc = 10;
    if (typeof bucketCount !== 'undefined') bc = bucketCount.getNumber();
    var min = Min(list).getNumber();
    //var min = 0;
    var max = Max(list).getNumber();
    //var max = 10;
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

function SplitUnique(table, tcol) {
    var outputs = {};
    for(var i=0; i<table.length(); i++) {
        var row = table.item(i);
        var col = row.itemByKey(tcol);
        var key = col.getString();
        if(!outputs.hasOwnProperty(key)) {
            outputs[key] = Literals.makeList([]);
        }
        outputs[key]._value.push(row);
    }
    console.log('Split unique',outputs);
    return Literals.makeList(Object.keys(outputs).map(function(key) {
        var value = outputs[key];
        return Literals.makeKeyValue(key, value);
    }));
}


function NDJSON(filename){
    return utils.invokeService("NDJSON",[filename]).then(function(rows) {
        return Literals.makeList(rows.map(function(row) {
            var names = ['ID','Timestamp','Publisher','InformationType','InformationFormat'];
            var vals = names.map(function(name) {
                return Literals.makeKeyValue(name, Literals.makeString(row[name]));
            });
            return Literals.makeList(vals);
        }));
    });
}

function MakeDate(month, day) {
    //console.log("making a date", month.getValue().toString(), day.getValue().toString());
    var mval = month.getValue()._value;
    var dval = day.getValue()._value;
    //console.log("mval = ", mval);
    //console.log('dval = ', dval);
    var date = moment();
    date.month(mval);
    date.date(dval);
    //console.log('date = ', date.toString());
    return Literals.makeDate(date);
}

function FilterByDateRange(data, column, start, end) {
    //console.log('start is ', start.getValue().type);
    function CustomListIterator() {
        this.index = 0;
        this.hasNext = function() {
            return (this.index < 5);
        };
        this.next = function() {
            //console.log("index is ", this.index);
            var row = data.item(this.index);
            this.index++;
            return row;
        }
    }

    function ListWrapper() {
        this.type = 'list-wrapper';
        this.getIterator = function() {
            return new CustomListIterator();
        };
        this.getColumnInfos = function() {
            return data.getColumnInfos();
        }
    }
    return new ListWrapper();
}

function BucketByDateTime(data, column, byArg) {
    var col = column.getValue().getString();
    var by  = byArg.getValue().getString();
    console.log('column = ', col, by);
    var it = data.getIterator();
    var cinfos = data.getColumnInfos();
    var cinfo = cinfos.filter(function(cinfo) { return cinfo.id() == col})[0];
    console.log("cinfo = ", cinfo.id());
    var bucket_map   = {};
    while(it.hasNext()) {
        var row = it.next();
        var ts = cinfo.getValue(row);
        //console.log('timestamp = ', ts);
        if(by == 'weekday') var key = ts.day();
        if(by == 'hour')    var key = ts.hour();
        if(by == 'minute')    var key = ts.minute();
        if(!bucket_map.hasOwnProperty(key)) {
            bucket_map[key] = 0;
        }
        bucket_map[key]++;
    }
    console.log('bucket_map', bucket_map)
    return Literals.makeList(Object.keys(bucket_map).map(function(key) {
        var val = bucket_map[key];
        return Literals.makeList([
            Literals.makeKeyValue(by,Literals.makeNumber(key)),
            Literals.makeKeyValue('count',Literals.makeNumber(val))
            ]);
    }));
}

exports.makeDefaultFunctions = function(ctx) {

    var sym = Symbols.make("PI");
    sym.update(Literals.makeNumber(Math.PI));
    ctx.register(sym);

    regSimple(ctx, Extendo(BaseValue, { name: "Min",         fun: Min  }));
    regSimple(ctx, Extendo(BaseValue, { name: "Max",         fun: Max  }));
    regSimple(ctx, Extendo(BaseValue, { name: "Mean",        fun: Mean }));
    regSimple(ctx, Extendo(BaseValue, { name: "Sum",         fun: Sum  }));
    regSimple(ctx, Extendo(BaseValue, { name: "Unique",      fun: Unique }));
    regSimple(ctx, Extendo(BaseValue, { name: "Histogram",   fun: Histogram }));

    regSimple(ctx, Extendo(BaseValue, { name: "SplitUnique", fun: SplitUnique }));
    regSimple(ctx, Extendo(BaseValue, { name: "NDJSON",      fun: NDJSON }));
    regSimple(ctx, Extendo(BaseValue, { name: "Date",        fun: MakeDate }));
    regSimple(ctx, Extendo(BaseValue, { name: "FilterByDateRange", fun: FilterByDateRange }));
    regSimple(ctx, Extendo(BaseValue, { name: "BucketByDateTime",  fun: BucketByDateTime }));

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
        name:'BarChart',
        fun: function(data, xaxis, yaxis) {
            var obj = Literals.makeEmpty();
            obj.data = data;
            obj.type = 'barchart';
            obj.xaxis = xaxis;
            obj.yaxis = yaxis;
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


};


function it2Array(it) {
    var arr = [];
    while(it.hasNext()) {
        arr.push(it.next());
    }
    return arr;
}