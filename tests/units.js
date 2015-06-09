var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var Units = require('../src/Units')
var test = require('tape');
var Context = require('../src/Context');
var ctx = Context.global();

 ct("add","5m + 6m",     11, ["meter",1],[]);
 ct("add","5mm+6ft",  6.016, ["foot",1], []);
ctf("add","5mm+6g");

 ct("sub","5m - 6m",     -1, ['meter',1],[]);
 ct('sub',"6ft-1m",   0.828, ['meter',1],[]);
ctf('sub','5mm - 6g');


ct("mul","5m*6m",30, ['meter',2],[]);
ct('mul',"5m * 6m as acres",0.00741316,['acre',1],[]);
ct('mul','5m * 6ft',16.404*6,['foot',2],[]);
ct('mul','5m * 6g',30,['meter',1,'gram',1],[]);
ct('mul','5m^2 * 6m',30,['meter',3],[]);
ct('mul','5m^2 * 6m as liter',30000,['litre',1],[]);

ct('div','60mi / 6hr',10,['mile',1],['hour',-1]);
ct('div','60mi / 6hr * 1hr',10,['mile',1,[]]);
ct('div','(60mi / 6hr) * 1mi',10,['mile',2],['hour',-1]);

ct('div','(60mi / 6hr) / 1mi',10,[],['hour',-1]);
ct('div','5mi / 1 min * 60 s',5,['mile',1],[]);

ct('div','1000 m / 100 m/s',
    10,['second',1],[]);
//ct('div','1000 km / 100 m/s',
//    10*1000,['second',1],[]);
ct('div', '5mi / 1 hr * 60 min',5,['mile',1],[]);
ct('mul', '1 km * 1 m',1000,['meter',2],[]);

ct('div', '100 m / 100 m',1,['none',0],[]);
ct('div', '1 km / 100 m',10,['none',0],[]);
ct('div', '1 m / 100 km',1/(100*1000),['none',0],[]);
ct('div', '1 km / 100 m/gal',10,['gallon',1],[]);
ct('div', '1 km / 100 m/s',10,['second',1],[]);
//5mi / 30min * 120s  = (5/30)*120 mi/min or mi * min^-1 or in seconds?

function printSimple(name,dim) {
    if(dim == 0) return "none";
    if(dim == 1) return name;
    return name + '^' + dim;
}
function prettyPrintUnit(u) {
    if(Units.isCompound(u)) {
        return "compound " + u.subunits.map(function(su) {
                if(su._dim < 0) {
                    return '/'+printSimple(su._name, -su._dim);
                } else {
                    return printSimple(su._name, su._dim);
                }
        }).join(" ");
    } else {
        return printSimple(u._name, u._dim);
    }
}

function ct(desc, str, val, numer, denom) {
    var epsilon = 0.01;
    test(desc, function(t) {
        var expr = Parser.matchAll(str,'start');
        expr.value(ctx).then(function(v){
            //console.log(v);
            if(Math.abs(val-v.getNumber())/val > epsilon) {
                t.fail("not equal " + val + " " +v._value);
            }
            var u = v.getUnit();
            //console.log("unit = ", u.toString());
            if(Units.isCompound(u)) {
                var nsubs = Units.getCompoundNumerators(u);
                nsubs.forEach(function(su,i) {
                    t.equal(Units.getSimpleName(su),numer[i*2],'comound unit name ' +numer[i*2]);
                    t.equal(Units.getSimpleDimension(su),numer[i*2+1],'compound unit dim '+numer[i*2+1]);
                });
                var dsubs = Units.getCompoundDenominators(u);
                dsubs.forEach(function(su,i) {
                    t.equal(Units.getSimpleName(su),denom[i*2],'comound unit name ' + denom[i*2]);
                    t.equal(Units.getSimpleDimension(su),denom[i*2+1],'compound unit dim '+denom[i*2+1]);
                });
            } else {
                t.equal(Units.getSimpleName(u),numer[0],'simple unit name ' + v.toString());
                t.equal(Units.getSimpleDimension(u),numer[1],'simple unit dim ' + v.toString());
            }
            t.end();
        },function(err){
            console.log("error shouldn't have happened",err);
        }).done();
    });
}

function ctf(desc, str) {
    test(desc, function(t) {
        var expr = Parser.matchAll(str, 'start');
        expr.value(ctx).then(function(v) {
            console.log("this one shouldn't succeed");
            t.fail();
        },function(err){
            //console.log("error should happened");
            t.end();
        }).done();
    });
}



