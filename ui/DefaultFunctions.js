var Literals = require('../src/Literals');
var Symbols = require('../src/Symbols');

exports.makeDefaultFunctions = function(ctx) {
    var makeList = {
        kind: 'function',
        type: 'simple',
        name: 'makeList',
        fun: function () {
            return Literals.makeList([Literals.makeNumber(1), Literals.makeNumber(2)]);
        }
    };
    ctx.register(Symbols.make(makeList.name), makeList);

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
}
