var Literals = require('./Literals');
var Units = require('./Units');
/**
 * Created by josh on 4/20/15.
 */
var Arithmetic = {
    Add: {
        type:'operation',
        name:'+',
        fun: function(A,B) {
            if(Units.equal(A.getUnit(),B.getUnit())) {
                return Literals.makeNumber(A._value+B._value,A.getUnit());
            }
            if(Units.sameType(A.getUnit(),B.getUnit())) {
                var bv = B._value;
                var av2 = Arithmetic.ConvertUnit.fun(A,B.getUnit());
                return Literals.makeNumber(av2._value+bv,B.getUnit());
            }
            console.log("throwing");
            throw new UnitConversionError("cannot convert between units",A.unit,B.unit);
        }
    },
    Multiply: {
        type:'operation',
        name:'*',
        fun: function(A,B) {
            //if no units
            if(!A.hasUnit() && !B.hasUnit()) return Literals.makeNumber(A._value*B._value);
            //if just A has a unit
            if(A.hasUnit() && !B.hasUnit())  return Literals.makeNumber(A._value*B._value,A.getUnit());
            //if just B has a unit
            if(!A.hasUnit() && B.hasUnit())  return Literals.makeNumber(A._value*B._value,B.getUnit());

            if(A.getUnit().type != 'compound' && B.getUnit().type == 'compound') {
                return MultiplyCompoundPost(A,B);
            }
            if(A.getUnit().type == 'compound' && B.getUnit().type != 'compound') {
                return MultiplyCompoundPost(B,A);
            }

            if(Units.sameName(A.getUnit(),B.getUnit())) {
                var dim = A.getUnit().getDimension()+B.getUnit().getDimension();
                var name = B.getUnit().getName();
                var nu = Units.Unit(name,dim);
                return Literals.makeNumber(A._value*B._value,nu);
            }


            if(Units.sameType(A.getUnit(),B.getUnit())) {
                var bv = B._value;
                var na = Arithmetic.ConvertUnit.fun(A,B.getUnit());
                var nu = Units.Unit(B.getUnit().getName(),A.getUnit().getDimension()+B.getUnit().getDimension());
                return Literals.makeNumber(na._value*bv, nu);
            }
            throw new Error("cannot convert between units " + A.getUnit() + " " + B.getUnit());
        }
    },
    Subtract: {
        type:'operation',
        name:'-',
        fun: function(A,B) {
            //console.log("subtracting numbers",A.toString(),B.toString());
            if(Units.equal(A.getUnit(),B.getUnit())) {
                return Literals.makeNumber(A._value-B._value,A.getUnit());
            }
            if(Units.sameType(A.getUnit(),B.getUnit())) {
                var bv = B._value;
                var av2 = Arithmetic.ConvertUnit.fun(A,B.getUnit());
                return Literals.makeNumber(av2._value-bv,B.getUnit());
            }
            throw new Error("cannot convert between units " + A.getUnit() + " " + B.getUnit());
        }
    },
    Divide: {
        type:'operation',
        name:'/',
        fun: function(A,B) {
            //if no units
            if(!A.hasUnit() && !B.hasUnit()) return Literals.makeNumber(A._value/B._value);
            //if just A has a unit
            if(A.hasUnit() && !B.hasUnit())  return Literals.makeNumber(A._value/B._value,A.getUnit());
            //if just B has a unit
            if(!A.hasUnit() && B.hasUnit())  return Literals.makeNumber(A._value/B._value,B.getUnit());

            if(Units.sameName(A.getUnit(),B.getUnit())) {
                var dim = A.getUnit().getDimension()-B.getUnit().getDimension();
                var name = B.getUnit().getName();
                var nu = Units.Unit(name,dim);
                return Literals.makeNumber(A._value/B._value,nu);
            }


            if(Units.sameType(A.getUnit(),B.getUnit())) {
                var bv = B._value;
                var na = Arithmetic.ConvertUnit.fun(A,B.getUnit());
                var nu = Units.Unit(B.getUnit().getName(),A.getUnit().getDimension()-B.getUnit().getDimension());
                return Literals.makeNumber(na._value/bv, nu);
            }
            throw new Error("cannot convert between units " + A.getUnit() + " " + B.getUnit());
        }
    },
    Exponent: {
        type:'operation',
        name:'^',
        fun: function(A,B) {
            if(!A.hasUnit() && !B.hasUnit()) {
                var v = Math.pow(A._value, B._value);
                return Literals.makeNumber(v);
            }
            if(A.hasUnit() && !B.hasUnit()) {
                var v = Math.pow(A._value, B._value);
                return Literals.makeNumber(v, A.getUnit());
            }
            throw new Error("cannot convert between units " + A.getUnit() + " " + B.getUnit());
        }
    },
    ConvertUnit:{
        type:'operation',
        name:'as',
        fun:function(a,u) {
            if(u.convert) return u.convert(a);
            //console.log('converting',a._value,'from',a.getUnit().toString(),'to',u.toString());
            var au = a.getUnit();
            var startu = u;
            if(au.type == u.type) {
                var av = a.getNumber();

                av = av * Math.pow(au.scale,au.getDimension());
                if(au.base == u.getName()) return Literals.makeNumber(av, u);
                if(au.base == u.base) return Literals.makeNumber(av / Math.pow(u.scale,u.getDimension()),u);

                au = Units.Unit(au.base,au.getDimension());
                if(au.base == u.getName()) return Literals.makeNumber(av * au.scale,u);
                if(au.base == u.base) return Literals.makeNumber(av / u.scale,u);
                av = av * au.scale;

                au = Units.Unit(au.base,au.getDimension());
                if(au.base == u.getName()) return Literals.makeNumber(av * au.scale,u);

                av = av * au.scale;
                au = Units.Unit(au.base,au.getDimension());
                if(au.base == u.getName()) return Literals.makeNumber(av * au.scale,u);

                var us = u.scale;
                if(au.getName() == u.base) {
                    return Literals.makeNumber(av * au.scale/us,u);
                }

                u = Units.Unit(u.base,u.getDimension());
                us *= u.scale;
                u = Units.Unit(u.base,u.getDimension());
                us *= u.scale;
                u = Units.Unit(u.base,u.getDimension());
                us *= u.scale;
                if(au.getName() == u.getName()) {
                    return Literals.makeNumber(av*au.scale/us, startu);
                }
                return Literals.makeNumber(av * au.scale / (us*u.scale), u);
            }

            if(au.type == 'length' && au.getDimension() == 3 && u.type == 'volume') {
                return CrossConvert(a,u);
            }
            if(a.getUnit().type == 'length' && a.getUnit().getDimension() == 2 && u.type == 'area') {
                return CrossConvert(a,u);
            }
            if(a.getUnit().type == 'area' && a.getUnit().getDimension() == 1 && u.type == 'length') {
                return CrossConvert(a,u);
            }

            console.log("ERROR! CAN'T CONVERT " + a.getUnit().toString() + " to " + u);
        }
    }
};

module.exports = Arithmetic;


function CrossConvert(a,u) {
    //console.log("cross converting " + a.getNumber() +  " " + a.getUnit().toString() + " " + u);
    var startu = u;
    //convert A to it's base unit
    var au = a.getUnit();
    var av = a.getNumber() * Math.pow(au.scale,au.getDimension());
    au = Units.Unit(au.base,au.getDimension());

    var us = 1;
    while(u.getName() != u.base) {
        us /= u.scale;
        u = Units.Unit(u.base,u.getDimension());
    }
    if(au.getName() == 'meter' && au.getDimension() == 3 && u.getName() == 'litre') {
        av = av*1000.0/1.0 * us;
        return Literals.makeNumber(av,startu);
    }
    if(au.getName() == 'meter' && au.getDimension() == 2 && u.getName() == 'acre') {
        var ratio = 0.000247105;
        av = av*ratio * us;
        return Literals.makeNumber(av,startu);
    }
    if(au.getName() == 'acre' && au.getDimension() == 1 && u.getName() == 'meter' && u.getDimension() == 2) {
        var ratio = 4046.86;
        av = av*ratio * us;
        return Literals.makeNumber(av,startu);
    }

    console.log("ERROR! CAN'T CROSS CONVERT " + au + " to " + u);
}

function printarray(lens) {
    console.log("array==")
    lens.forEach(function(u){
        console.log(u.toString());
    });
}
function reduceUnits(subunits,type) {
    var lens = subunits.filter(function(u) { return u.type == type; });
    if(lens.length > 1) {
        //console.log("have to reduce",type);
        var dim = 0;
        lens.forEach(function(u){
            dim += u._dim;
        });
        //console.log("final dim = ", dim, lens[0]._name);
        return Units.Unit(lens[0]._name,dim);
    } else {
        return Units.Unit(lens[0]._name,lens[0]._dim);
    }
}

function MultiplyCompoundPost(A,B) {
    //console.log("multiplying",A.toString(),B.toString());
    var fval = A.getNumber() * B.getNumber();
    //console.log("new val = ",fval);
    var subunits = B.getUnit().subunits.slice();
    subunits.push(A.getUnit());
    //printarray(subunits);
    var finalunits = [];
    finalunits.push(reduceUnits(subunits,'length'));
    finalunits.push(reduceUnits(subunits,'duration'));
    //printarray(finalunits);
    return Literals.makeNumber(fval,Units.CompoundUnitFromList(finalunits));
}