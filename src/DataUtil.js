/**
 * Created by josh on 5/16/15.
 */

module.exports = {
    is1D: function(data) {
        var first = data._value[0];
        if(first.isNumber()) return true;
        return false;
    },
    is2D: function(data) {
        var first = data.item(0);
        if(first.isList()) return true;
        return false;
    },
    is3D: function(data) {
        var first = data.item(0);
        console.log("first in 3d is", first.toString());
        if(first.type == 'pair') {
            var val = first.getValue();
            if(val.type == 'list') {
                console.log("second level is list");
                return true;
            }
        }
        return false;
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

