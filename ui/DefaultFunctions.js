var Literals = require('../src/Literals');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');

function regSimple(ctx,fun) {
    fun.kind = "function";
    fun.type = "simple";
    var sym = Symbols.make(fun.name);
    sym.update(fun);
    if(fun.init) fun.init();
    ctx.register(sym);
}

exports.makeDefaultFunctions = function(ctx) {
    var makeList = {
        kind: 'function',
        type: 'simple',
        name: 'makeList',
        fun: function () {
            return Literals.makeList([Literals.makeNumber(1), Literals.makeNumber(2)]);
        }
    };
    var mklistsym = Symbols.make(makeList.name);
    mklistsym.update(makeList);
    ctx.register(mklistsym);

    var setColumnFormat = {
        kind:'function',
        type:'simple',
        name:'setColumnFormat',
        fun: function(data) {
            console.log('data',data);
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
            return new setColumnFormat(data,'birthdate',{type:'date', parsePattern:'MM-DD-YY', printPattern: 'MMMM DD, YYYY'});
        }
    };

    ctx.register(Symbols.make(setColumnFormat.name), setColumnFormat);
    regSimple(ctx,{
        name:'makeGrowTable',
        cbs:[],
        onChange:function(cb) {
            this.cbs.push(cb);
        },
        notify: function() {
            var self = this;
            this.cbs.forEach(function(cb) {
                cb(self);
            });
        },
        init: function() {
            var items = [Literals.makeNumber(1), Literals.makeNumber(2)];
            this.list = Literals.makeList(items);
            var i = 3;
            var self = this;
            setInterval(function () {
                items.push(Literals.makeNumber(i));
                self.list.update(items);
                Context.global().lookup('makeGrowTable').notify();
                i++;
            }, 2500);
        },
        fun: function() {
            return this.list;
        }
    });
}
