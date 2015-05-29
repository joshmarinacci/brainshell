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

var MinDoc = {
    short: "Returns the minimum value of a list or table",
    examples: [
        "Min([1,2,3,4,5])  returns 1"
    ]
};
function Min(data)  { return DataUtil.reduceListOrTable(data, MinFunc, Number.MAX_VALUE); };

var MaxDoc = {
    short: "Returns the maximum value of a list or table",
    long: "Returns the maximum value of a list or table. If called on a list"+
    "Max returns one value. If called on a table, Max will calculate the maximum for each"+
    "column of the table.",
    examples: [
        "Max([1,2,3,4,5])  returns 5",
        "Max([  [1,2], [5,4], [3,8] ]) returns [5,8]"
    ]
};
function Max(data)  { return DataUtil.reduceListOrTable(data, MaxFunc, -Number.MAX_VALUE); }

var SumDoc = {
    short: "Returns the sum of a list or columns of a table",
    examples: [
        "Sum([1,2,3]) => 6",
        "Sum([ [x:1, y:1], [x:2, y:4] ]) => [x:3, y:5]"
    ]
}
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
    var it = table.getIterator();
    while(it.hasNext()) {
        var row = it.next();
        var col = row.itemByKey(tcol.getString());
        var key = col.getString();
        if(!outputs.hasOwnProperty(key)) {
            outputs[key] = Literals.makeList([]);
        }
        outputs[key]._value.push(row);
    }
    return Literals.makeList(Object.keys(outputs).map(function(key) {
        var value = outputs[key];
        return Literals.makeKeyValue(key, value);
    }));
}


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

var NDJSONDoc = {
    short: "Loads a newline delimited JSON document, with an optional line count. Default is 100 lines",
    examples: [
        "NDJSON('events.json') => first 100 lines of the table",
        "NDJSON('events.json',200) => first 200 lines of the table"
    ]
}

function NDJSON(filename, len){
    return utils.invokeService("NDJSON",[filename,len]).then(function(rows) {
        var first = rows[0];
        //console.log("got some rows. first is ",first);
        var cinfos = Object.keys(first).map(function(key) {
            var info = DataUtil.makeStringColumnInfo(key);
            info.print = function(row) {
                var val = this.getValue(row);
                if(!val) return "";
                if(val.length > 80) {
                    return val.substring(0,80)+'...';
                }
                return ""+val;
            }
            return info;
        });
        return {
            type:'list-wrapper',
            getIterator: function() {
                return new ArrayIterator(rows);
            },
            getColumnInfos: function() {
                return cinfos;
            },
            value : function() {
                var self = this;
                return Q.fcall(function() {
                    return self;
                });
            },
            toString: function() {
                return "NDJSON LIST RESULTS";
            }
        };
    });
}

var TweetStreamDoc = {
    short:"Loads a realtime twitter stream",
    examples: [
        "TweetStream('#kardashian') prints a realtime table of tweets w/ text and username"
    ]
};
function TweetStream(query) {
    console.log("query = ", query);
    return utils.invokeLiveService("TweetStream",{query:'arduino'}).then(function(stream) {
        var items = [];
        var list = Literals.makeList(items);
        stream.listen(function(obj) {
            items.push(obj);
            list.update(items);
        });
        return list;
    });
}

var DateDoc = {
    short: "Creates a new date object",
    examples: [
        "Date( month: 'May', date:5) => May 5th 2015",
        "Date( month: 5, date:5) => May 5th 2015"
    ]
};

function MakeDate(month, day) {
    var kargs = FuncUtils.getKeyValues(arguments);
    var date = moment();
    if(kargs.month) {
        date.month(kargs.month._value);
    }
    if(kargs.date) {
        date.date(kargs.date.getNumber());
    }
    if(kargs.year) {
        date.year(kargs.year.getNumber());
    }
    return Literals.makeDate(date);
}

var FilterByDateRangeDoc = {
    short:"filter a table by a date range from the requested column",
    examples: [
        "FilterByDateRange(data, 'date_column', start: Date( month: 'May', year:1997) )"
    ]
};

function FilterByDateRange(data, column) {
    var kargs = FuncUtils.getKeyValues(arguments);
    if(!kargs['start'] && !kargs['end']) throw new Error("start or end parameter missing");
    if(kargs['start']) {
        var start = kargs['start'].getDate();
    } else {
        var start = null;
    }
    if(kargs['end']) {
        var end = kargs['end'].getDate();
    } else {
        var end = null;
    }

    function ListWrapper() {
        this.type = 'list-wrapper';
        this.getIterator = function() {
            var arr = DataUtil.listToJSArray(data);
            var info = DataUtil.findColumnInfoFor(data,column.getString());
            var res = arr.filter(function(row) {
                var date = info.getValue(row);
                if(start != null ) {
                    if(start.isAfter(date)) return false;
                }
                if(end != null) {
                    if(end.isBefore(date)) return false;
                }
                return true;
            });
            return DataUtil.JSArrayToIterator(res);
        };
        this.getColumnInfos = function() {
            return data.getColumnInfos();
        }
    }
    return new ListWrapper();
}

function BucketByDateTime(data, column, byArg) {
    if(!column || column.getKey() !== 'column') {
        throw new Error("'column' parameter is missing");
    }
    if(!byArg || byArg.getKey() !== 'by') {
        throw new Error("'by' parameter is missing");
    }
    var col = column.getValue().getString();
    var by  = byArg.getValue().getString();
    var it = data.getIterator();
    var cinfo = DataUtil.findColumnInfoFor(data,col);
    var bucket_map   = {};
    while(it.hasNext()) {
        var row = it.next();
        var ts = cinfo.getValue(row);
        if(by == 'weekday') var key = ts.day();
        if(by == 'hour')    var key = ts.hour();
        if(by == 'minute')    var key = ts.minute();
        if(!bucket_map.hasOwnProperty(key)) {
            bucket_map[key] = 0;
        }
        bucket_map[key]++;
    }
    return Literals.makeList(Object.keys(bucket_map).map(function(key) {
        var val = bucket_map[key];
        return Literals.makeList([
            Literals.makeKeyValue(by,Literals.makeNumber(key)),
            Literals.makeKeyValue('count',Literals.makeNumber(val))
            ]);
    }));
}

var FuncUtils = {
    getArgs: function(args) {
        return Array.prototype.slice.call(args);
    },
    getKeyValues: function(args) {
        var arr = Array.prototype.slice.call(args);
        var kvarr = arr.filter(DataUtil.isPair);
        var kvmap = {};
        for(var i =0; i<kvarr.length; i++) {
            var pair = kvarr[i];
            kvmap[pair.getKey()] = pair.getValue();
        }
        return kvmap;
    }
}

var UseColumnsDoc = {
    short:"add or remove columns from a table",
    examples:[
        "UseColumns(data,exclude:'Timestamp')  remove timestamp column, keep the rest",
        "UseColumns(data,include:'Timestamp')  keep timestamp column, remove the rest"
    ]
};
function UseColumns(data) {
    var args = FuncUtils.getArgs(arguments);
    args.shift(); //take out data first
    return {
        type:'list-wrapper',
        getIterator: function() {
            return data.getIterator();
        },
        getColumnInfos: function() {
            var cinfos = data.getColumnInfos().slice();
            var first = args[0];
            if(first.getKey() == 'exclude') {
                args.forEach(function(arg) {
                    cinfos = cinfos.filter(function(info) {
                        return info.id() != arg.getValue().getString();
                    })
                });
                return cinfos;
            }
            if(first.getKey() == 'include') {
                var collect = [];
                args.forEach(function(arg) {
                    cinfos.forEach(function(info) {
                        if(info.id() == arg.getValue().getString()) collect.push(info)
                    })
                });
                return collect;
            }
            throw new Error("can't do this! UseColumns but not exclude or include");
        },
        value : function() {
            var self = this;
            return Q.fcall(function() {
                return self;
            });
        },
        toString: function() {
            return "UseColumns results";
        }
    };
}

var GetColumnDoc = {
    short: 'extract one column of a table',
    examples: [
        "get column example here"
    ]
};
function GetColumn(data, name) {
    if(!name) throw new Error("missing column name parameter");
    return {
        type: 'list-wrapper',
        getIterator: function() {
            function ArrayIterator(data) {
                var it = data.getIterator();
                this.hasNext = function() {
                    return it.hasNext();
                };
                this.next = function() {
                    var row = it.next();
                    if(row.type == 'list') {
                        return row.itemByKey(name.getString());
                    }
                    return row;
                }
            }
            return new ArrayIterator(data);
        },
        getColumnInfos: function() {
            var cinfos = data.getColumnInfos().slice();
            var info = DataUtil.findColumnInfoFor(data,name.getString());
            return [{
                id: function() {
                    return 0;
                },
                title: function () {
                    return this.id() + "";
                },
                type: function() {
                    return info.type();
                },
                getValue: function(row) {
                    return row;
                },
                print: function(row) {
                    return this.getValue(row).toCode();
                }
            }];
        },
        value : function() {
            var self = this;
            return Q.fcall(function() {
                return self;
            });
        },
        toString: function() {
            return "list wrapper";
        }
    }
}
var SetFormatDoc = {
    short:'set format of list',
    examples: [
        "SetFormat(['1','2'], 'number') prints [1,2]"
    ]
};
function SetFormat(data, type) {
    return {
        type: 'list-wrapper',
        getIterator: function() {
            return data.getIterator();
        },
        getColumnInfos: function() {
            if(type.getString() == 'number') {
                return [{
                    id: function () {
                        return 0;
                    },
                    title: function () {
                        return this.id() + "";
                    },
                    type: function () {
                        return 'number';
                    },
                    getValue: function (val) {
                        if (DataUtil.isNumber(val)) return val;
                        if (val.type == 'string') return Literals.makeNumber(parseFloat(val.getString()));
                        console.log("unexpcted type",val);
                        return null;
                    },
                    print: function (row) {
                        var val = this.getValue(row);
                        if(DataUtil.isNumber(val)) return val.toCode();
                        if (val.type == 'string') return Literals.makeNumber(parseFloat(val.getString())).toCode();
                        console.log("unexpcted type ", val);
                        return null;///greturn this.getValue(row).toCode();
                    }
                }]
            }
            throw new Error('only number type is supported');
        },
        value : function() {
            var self = this;
            return Q.fcall(function() {
                return self;
            });
        },
        toString: function() {
            return "list wrapper";
        }
    }
}

var SetColumnFormatDoc = {
    short:"set formatting on a column in a table",
    examples:[
        "setColumnFormat(table, 'timestamp', type:'date', parsePattern:'x')  set 'timestamp' column to be a date",
        "setColumnFormat(table, 'timestamp', type:'date')  set 'timestamp' column to be a date",
        "setColumnFormat(table, 'ending', type:'date', parsePattern:'MM dd yyyy')  set 'ending' column to be a date"
    ]
};

var BarChartDoc = {
    short:'draw a barchart from data',
    arguments:[
        "data: bars are drawn in row order",
        "xaxis: column to use to label the bars",
        "yaxis: column to use for the bar heights"
    ],
    examples:[
        "BarChart( [ [fruit:'banana',count:1], [fruit:'apple',count:2], [fruit:'pear',count:3] ], xaxis:'fruit', yaxis:'count')"
    ]
};

var BarChart =  function(data, xaxis, yaxis) {
    var obj = Literals.makeEmpty();
    obj.data = data;
    obj.type = 'barchart';
    obj.xaxis = xaxis;
    obj.yaxis = yaxis;
    return obj;
};


var RandomDoc = {
    short:"generate random numbers",
    examples: [
        "Random()  one random number from 0 to 1",
        "Random(10) a list of 10 random numbers from 0 to 1",
        "Random(min:-1) one random number from -1 to 1",
        "Random(max:100) one random number from 0 to 100"
    ]
};

function Random() {
    function makeRand(min,max) {
        return Literals.makeNumber(Math.random()*(max-min) + min);
    }
    var args = FuncUtils.getArgs(arguments);
    var kargs = FuncUtils.getKeyValues(arguments);
    var count = 1;
    var min = 0;
    var max = 1;
    if(kargs['min']) min = kargs['min'].getNumber();
    if(kargs['max']) max = kargs['max'].getNumber();
    if(DataUtil.isNumber(args[0])) {
        count = DataUtil.getNumber(args[0]);
        var arr = [];
        for(var i=0; i<count; i++) {
            arr.push(makeRand(min,max));
        }
        return Literals.makeList(arr);
    } else {
        return makeRand(min,max);
    }
}

var AccumulateDoc = {
    short:'running total of a list of numbers',
    examples: [
        "Accumulate([1,2,3,4]) prints [3, 6, 10]"
    ]
};
function Accumulate(data) {
    var arr = [];
    if(!DataUtil.isList(data)) throw new Error("argument is not a list");
    var it = data.getIterator();
    var total = it.next().getNumber();
    while(it.hasNext()) {
        total += it.next().getNumber();
        arr.push(Literals.makeNumber(total));
    }
    return Literals.makeList(arr);
}


var SliderDoc = {
    short:"bind a Slider to a symbol",
    examples: [
        "x=50; Slider(x); x=75"
    ]
};
function Slider(symbol) {
    return {
        kind: 'control',
        type: 'slider',
        symbol: symbol,
    }
}

/*
 NDJSON('events.json',100)
 => UseColumns(include:'Timestamp', include:'Publisher')
 => setColumnFormat('Timestamp',type:'date', parsePattern:'x')
 => BucketByDateTime()
 */
exports.makeDefaultFunctions = function(ctx) {

    var sym = Symbols.make("PI");
    sym.update(Literals.makeNumber(Math.PI));
    ctx.register(sym);

    regSimple(ctx, Extendo(BaseValue, { name: "Min",         fun: Min, doc:MinDoc  }));
    regSimple(ctx, Extendo(BaseValue, { name: "Max",         fun: Max, doc:MaxDoc  }));
    regSimple(ctx, Extendo(BaseValue, { name: "Mean",        fun: Mean }));
    regSimple(ctx, Extendo(BaseValue, { name: "Sum",         fun: Sum, doc:SumDoc  }));
    regSimple(ctx, Extendo(BaseValue, { name: "Unique",      fun: Unique }));
    regSimple(ctx, Extendo(BaseValue, { name: "Histogram",   fun: Histogram }));

    regSimple(ctx, Extendo(BaseValue, { name: "SplitUnique", fun: SplitUnique }));
    regSimple(ctx, Extendo(BaseValue, { name: "NDJSON",      fun: NDJSON, doc:NDJSONDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "TweetStream", fun: TweetStream, doc:TweetStreamDoc, dataUpdate:true }));
    regSimple(ctx, Extendo(BaseValue, { name: "Date",        fun: MakeDate, doc:DateDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "FilterByDateRange", fun: FilterByDateRange, doc:FilterByDateRangeDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "BucketByDateTime",  fun: BucketByDateTime }));
    regSimple(ctx, Extendo(BaseValue, { name: "UseColumns",  fun: UseColumns, doc:UseColumnsDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "GetColumn",   fun: GetColumn,  doc:GetColumnDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "SetFormat",   fun: SetFormat,  doc:SetFormatDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "Random",      fun: Random,  doc:RandomDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "Accumulate",  fun: Accumulate, doc:AccumulateDoc }));
    regSimple(ctx, Extendo(BaseValue, { name: "Slider",      fun: Slider, doc:SliderDoc, firstRaw:true }));

    regSimple(ctx,{
        name:'setColumnFormat',
        doc:SetColumnFormatDoc,
        fun: function(data, columnArg) {
            var kargs = FuncUtils.getKeyValues(arguments);
            var column = columnArg.getString();
            var type = kargs['type'].getString();
            var parsePattern = null;
            if(kargs['parsePattern']) {
                parsePattern = kargs['parsePattern'].getString();
            }

            //var parsePattern = parseArg._value._value;
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
                    var oldInfo = infos[index];
                    var newInfo = new StdColumnInfo(key,options.type);
                    if(options.type == 'number') {
                        newInfo.getValue = function (row) {
                            return parseFloat(row[this.id()]);
                        };
                    }
                    if(options.type == 'date') {
                        newInfo.getValue = function(row) {
                            if(options.parsePattern == null) {
                                return moment(oldInfo.getValue(row).getString());
                            }
                            return  moment(oldInfo.getValue(row), options.parsePattern);
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
                };
                this.value = function() {
                    var self = this;
                    return Q.fcall(function() {
                        return self;
                    });
                };
            }
            return new setColumnFormat(data, column,
                {
                    type:type,
                    parsePattern: parsePattern,
                    printPattern: 'MMM DD YYYY, hh:mm'
                });
        }
    });

    regSimple(ctx, Extendo(BaseValue,{
        name:'RandomWalk',
        dataUpdate:true,
        fun: function () {
            var items = [];
            var list = Literals.makeList(items);
            var num = 0;
            function appendNumber() {
                num += (Math.random()*10)-5;
                items.push(Literals.makeNumber(num));
                list.update(items);
            }
            setInterval(appendNumber,1000);
            return list;
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

    regSimple(ctx, Extendo(BaseValue,{ name:'BarChart',  doc:BarChartDoc, fun: BarChart }));

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

    var StockHistoryDoc = {
        short:'fetch full history of a stock symbol',
        examples:[
            "StockHistory('NNOK')",
            "StockHistory('AAPL')"
        ]
    };

    regSimple(ctx, Extendo(BaseValue, {
        name:"StockHistory",
        doc:StockHistoryDoc,
        init: function() {
            this._cbs=[];
            this.cache = {}
        },
        fun: function() {
            var self = this;
            if(this.cache['AAPL']) {
                console.log("returning stock history from cache");
                return this.cache['AAPL'];
            }
            return utils.invokeService("StockHistory",["AAPL"]).then(function(rows) {
                var retval = Literals.makeList(rows.map(function(row) {
                    var vals = [];
                    for(var name in row) {
                        vals.push(Literals.makeKeyValue(name,Literals.makeString(row[name])));
                    }
                    return Literals.makeList(vals);
                }));
                self.cache['AAPL'] = retval;
                return self.cache['AAPL'];
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