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
            //console.log("multiplying",A.toString(),B.toString());
            //if no units
            if(!A.hasUnit() && !B.hasUnit()) return Literals.makeNumber(A._value*B._value);
            //if just A has a unit
            if(A.hasUnit() && !B.hasUnit())  return Literals.makeNumber(A._value*B._value,A.getUnit());
            //if just B has a unit
            if(!A.hasUnit() && B.hasUnit())  return Literals.makeNumber(A._value*B._value,B.getUnit());

            if(Units.sameName(A.getUnit(),B.getUnit())) {
                var dim = A.getUnit().dim+B.getUnit().dim;
                var name = A.getUnit().name;
                var nu = Units.Unit(name,dim);
                return Literals.makeNumber(A._value*B._value,nu);
            }


            return Literals.makeNumber(A._value*B._value);
        }
    },
    Subtract: {
        type:'operation',
        name:'*',
        fun: function(a,b) {
            return Literals.makeNumber(a._value-b._value);
        }
    },
    Divide: {
        type:'operation',
        name:'*',
        fun: function(a,b) {
            return Literals.makeNumber(a._value/b._value);
        }
    },
    Exponent: {
        type:'operation',
        name:'^',
        fun: function(a,b) {
            var v = Math.pow(a._value,b._value);
            return Literals.makeNumber(v);
        }
    },
    ConvertUnit:{
        type:'operation',
        name:'as',
        fun:function(a,u) {
            //console.log('converting',a._value,'from',a.getUnit().toString(),'to',u.toString());
            var au = a.getUnit();
            var startu = u;
            if(au.type == u.type) {
                var av = a.getNumber();

                av = av * Math.pow(au.scale,au.dim);
                if(au.base == u.name) return Literals.makeNumber(av, u);
                if(au.base == u.base) return Literals.makeNumber(av / Math.pow(u.scale,u.dim),u);

                au = Units.Unit(au.base,au.dim);
                if(au.base == u.name) return Literals.makeNumber(av * au.scale,u);
                if(au.base == u.base) return Num(av / u.scale,u);
                av = av * au.scale;

                au = Units.Unit(au.base,au.dim);
                if(au.base == u.name) return Num(av * au.scale,u);

                av = av * au.scale;
                au = Units.Unit(au.base,au.dim);
                if(au.base == u.name) return Num(av * au.scale,u);

                var us = u.scale;
                if(au.name == u.base) {
                    return Num(av * au.scale/us,u);
                }

                u = Units.Unit(u.base,u.dim);
                us *= u.scale;
                u = Units.Unit(u.base,u.dim);
                us *= u.scale;
                u = Units.Unit(u.base,u.dim);
                us *= u.scale;
                if(au.name == u.name) {
                    return Literals.makeNumber(av*au.scale/us, startu);
                }
                return Literals.makeNumber(av * au.scale / (us*u.scale), u);
            }

            if(au.type == 'length' && au.dim == 3 && u.type == 'volume') {
                return CrossConvert(a,u);
            }
            if(a.unit.type == 'length' && a.unit.dim == 2 && u.type == 'area') {
                return CrossConvert(a,u);
            }
            console.log("ERROR! CAN'T CONVERT " + a.unit + " to " + u);
        }
    }
};

module.exports = Arithmetic;


function CrossConvert(a,u) {
    //console.log("cross converting " + a.getNumber() +  " " + a.getUnit().toString() + " " + u);
    var startu = u;
    //convert A to it's base unit
    var au = a.getUnit();
    var av = a.getNumber() * Math.pow(au.scale,au.dim);
    au = Units.Unit(au.base,au.dim);

    var us = 1;
    if(u.name != u.base) {
        us /= u.scale;
        u = Units.Unit(u.base,u.dim);
    }
    if(au.name == 'meter' && au.dim == 3 && u.name == 'litre') {
        av = av*1000.0/1.0 * us;
        return Literals.makeNumber(av,startu);
    }
    if(au.name == 'meter' && au.dim == 2 && u.name == 'acre') {
        av = av/4046.8564224 * us;
        return Literals.makeNumber(av,startu);
    }

    console.log("ERROR! CAN'T CROSS CONVERT " + au + " to " + u);
}
