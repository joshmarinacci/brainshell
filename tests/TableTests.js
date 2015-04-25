/**
 * Created by josh on 4/25/15.
 */
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var Expressions = require('../src/Expressions');
var Literals = require('../src/Literals');
var moment = require('moment');
var ctx = Context;


//make a table of 5 rows with string, number, datestring, string containing a number
//print out using a lazy iterator
//print out list of columns ordered by natural order
//print out types of row of data
//print out format of data,  ex: date for datestring. number for string
//print out formatter of data
//use formatter of data
//make function which returns iterator where date column is transformed into moments
//make a function which returns iterator where one column is dropped
//make a function which returns iterator where one column has a new title
//make a function which returns iterator where one column has a custom date format

//how bad will this performance be?

//table needs to return column data, which is detected from the first row
/*

a column has
    id
    accessor (??)
    type: number, string, list, function, etc
    format: hint about the format of the object. only relevant to strings
    formatter: function to render the object to a nice string. dates. decimal, etc.
    title: used for the column header
    halign: preferred alignment for that column

    any of these values may be missing

    it is assumed that these values are valid for the entire column




demo:

    {
        first:'bob',
        last:'smith',
        birthdate: '10-3-75',
        weight: '148.6lbs',
        height: 1.2,
    }

data
    => dropColumn('first')
    => setColumnFormat('birthdate',type:'date', parsePattern:'MM-DD-YY', printPattern: 'MMMM DD, YYYY')
    => setColumnFormat('weight', kind:'number', unit:'pounds', parsePattern:'d+.d*lbs', printPattern:'d.d')
    => setColumnFormat('height', unit:'meters', printUnit:'feet')
    => filterOut(Fun(person, person.weight < 50lbs OR person.weight > 300lbs))
    => sortBy('weight', order:'descending')


list.getColumnInfos(): {} info
 list.getIterator()
    next(): row
    hasNext(): boolean

while it.hasNext()
    var row = it.next();
    infos.map(function(info){
        console.log(info.id(),info.title(),info.type());
        console.log("raw value = ", info.getValue(row));
        return info.print(row);
    });


setColumnFormat returns:

return {
    kind: 'virtual',
    type: 'list',
    getColumnInfos: function() {
        var infos = list.getColumnInfos();
        infos['birthdate'].type = date;
        infos['birthdate'].parsePattern = 'MM-DD-YY'
        return infos;
    }
    getIterator: list.getIterator()
}

filterOut returns
    return {
        kind:'virtual',
        type:'list',
        getIterator: function() {
            var it = list.getIterator();
        return {
                isValid: function(row) {
                    return row.weight < 50lbs
                }
                next: function() {
                    var row = it.next();
                    if(isValid(row)) return row; //skip if invalid
                    return it.next();
                }
                hasNext: function() {

                }
        }
}

sortBy returns
    return {
        getIterator: function() {
            var data = slurp(list.getIterator());
            data.sort(compFunc)
            return new ArrayIterator(data);
        }
    }

 */

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

function Table() {
    this.data = []
    for(var i=0; i<10; i++) {
        this.data.push({
            first:'bob'+i,
            last:'smith'+i,
            birthdate:(i+1)+'-'+3+'-'+(70+i),
            weight:(20+i*20)+'lbs',
            height: 0.5+i*0.1
        });
    }

    this.getIterator = function() {
        var data = this.data;
        return {
            index: 0,
            hasNext: function() {
                return (this.index < data.length);
            },
            next: function() {
                var row = data[this.index];
                this.index++;
                return row;
            }
        }
    };

    this.getColumnInfos = function() {
        return [
            new StdColumnInfo('first','string'),
            new StdColumnInfo('last','string'),
            new StdColumnInfo('birthdate','string'),
            new StdColumnInfo('weight','string'),
            new StdColumnInfo('height','number')
        ];
    }
}

function setColumnFormat(list, key, options) {
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
                return  moment(row[this.id()], options.parsePattern);
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

function FilterOut(list) {
    this.getIterator = function() {
        var it = list.getIterator();
        var infos = list.getColumnInfos();
        var index = 0;
        var key = 'weight';
        for(var i=0; i<infos.length; i++) {
            if(infos[i].id() == key) {
                index = i;
                break;
            }
        }
        var info = infos[index];
        console.log("using info",info);

        return {
            index:0,
            hasNext: function() {
                return it.hasNext();
            },
            next: function() {
                var row = null;
                while(true) {
                    row = it.next();
                    if(row == null) break;
                    var val = info.getValue(row);
                    if (val < 50 || val > 170) {
                    } else {
                        break;
                    }
                }
                return row;
            }
        }
    };
    this.getColumnInfos = function() {
        return list.getColumnInfos();
    }
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

function SortBy(list, key, options) {
    this.getIterator = function() {
        var it = list.getIterator();
        var data = [];
        while(it.hasNext()) {
            var row = it.next();
            if(row == null) continue;
            data.push(row);
        }
        var infos = list.getColumnInfos();
        var index = 0;
        var key = 'weight';
        for(var i=0; i<infos.length; i++) {
            if(infos[i].id() == key) {
                index = i;
                break;
            }
        }
        var info = infos[index];
        data.sort(function(a,b) {
            var va = info.getValue(a);
            var vb = info.getValue(b);
            if(options.order == 'ascending') {
                return va-vb;
            }
            if(options.order == 'descending') {
                return vb-va;
            }
            return vb-va;
        });
        return new ArrayIterator(data);
    };
    this.getColumnInfos = function() {
        return list.getColumnInfos();
    }
}

function printTable(data) {
    var it = data.getIterator();
    var infos = data.getColumnInfos();
    var count = 0;
    while (it.hasNext()) {
        var row = it.next();
        if(row == null) break;
        var out = infos.map(function (info) {
            //console.log(info.id(), info.title(), info.type(), info.getValue(row).toString());
            return info.print(row);
        });
        console.log('row '+count,out.join(" | "),'\n');
        count++;
    }
}


var data = new Table();
var wrap1 = new setColumnFormat(data,'weight',{type:'number',parsePattern:'d.ddlbs', unit:'pounds'});
var wrap2 = new setColumnFormat(wrap1,'birthdate',{type:'date', parsePattern:'MM-DD-YY', printPattern: 'MMMM DD, YYYY'});
var wrap3 = new FilterOut(wrap2);
var wrap4 = new SortBy(wrap3, 'height', {order:'descending'});
printTable(wrap4);