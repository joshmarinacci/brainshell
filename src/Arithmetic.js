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

            if(A.getUnit().type == 'compound' || B.getUnit().type == 'compound') {
                return MultiplyToCompound(A,B);
            }

            if(Units.sameName(A.getUnit(),B.getUnit())) {
                //return MultiplyToCompound(A,B);
                var dim = A.getUnit().getDimension()+B.getUnit().getDimension();
                var name = B.getUnit().getName();
                var nu = Units.Unit(name,dim);
                return Literals.makeNumber(A._value*B._value,nu);
            }


            if(Units.sameType(A.getUnit(),B.getUnit())) {
                //return MultiplyToCompound(A,B);
                var bv = B._value;
                var na = Arithmetic.ConvertUnit.fun(A,B.getUnit());
                var nu = Units.Unit(B.getUnit().getName(),A.getUnit().getDimension()+B.getUnit().getDimension());
                return Literals.makeNumber(na._value*bv, nu);
            }
            return MultiplyToCompound(A,B);
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
            return DivideToCompound(A,B);
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
            if(au.type == 'compound' && u.type =='compound') {
                return compoundToCompoundConversion(a,u);
            }
            if(Units.canSimplifyCompound(au)) {
                au = Units.simplifyCompound(au);
            }

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
            throw new Error("ERROR! CAN'T CONVERT " + a.getUnit().toString() + " to " + u);
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
    if(lens.length <= 0) return null;
    if(lens.length == 1) {
        return [1,Units.Unit(lens[0]._name,lens[0]._dim)];
    }

    //multiple lengths
    var val = 1;
    var b = lens.shift();
    var fdim = b._dim;
    //console.log("have to reduce",type, 'to',b._name,'scale=',b.scale);
    lens.forEach(function(u){
        fdim += u._dim;
        if(u._name != b._name) {
            //console.log("TYPE MISMATCH", u + ' to ' + b, ' base =',u.base);
            //reduce to the base
            var us = 1;
            while(u.getName() != b.getName()) {
                //console.log(u +" to " + b);
                us /= u.scale;
                u = Units.Unit(u.base,u.getDimension());
                if(u.getName() == u.base) {
                    //console.log("hit the end");
                    break;
                }
            }
            val *= us;
        }
        //if still not reduced then switch direction
        if(u._name != b._name) {
            var a=b;
            b=u;
            u=a;
            //console.log("still not matched. switch direction");
            var us = 1;
            while(u.getName() != b.getName()) {
                //console.log(u +" to " + b);
                us /= u.scale;
                u = Units.Unit(u.base,u.getDimension());
                if(u.getName() == u.base) {
                    //console.log("hit the end");
                    break;
                }
            }
            val /= us;
        }

        //console.log("final = " + u + " " + b, fdim);
    });
    //console.log("final unit= name = " + b._name + " dim = " + fdim + " val = "+ val);
    return [val,Units.Unit(b._name,fdim)];
}

function produceFinalCompound(fval, finalunits) {
    //console.log("producing final compound");
    //strip units with dim 0 or null units
    var out = [];
    finalunits.forEach(function(uu){
        if(uu == null) return;
        var v = uu[0];
        //console.log("v = ", v);
        fval *= v;
        var u = uu[1];
        if(u.getDimension() == 0) return;
        out.push(u);
    });
    //printarray(out);
    return Literals.makeNumber(fval, Units.CompoundUnitFromList(out));
}

function MultiplyToCompound(A,B) {
    //console.log("multiplying to compound",A.toString(),B.toString());
    var fval = A.getNumber() * B.getNumber();
    var subunits = [];
    if(B.getUnit().type == 'compound') {
        B.getUnit().subunits.forEach(function(su) {
            subunits.push(Units.Unit(su.getName(),su.getDimension()));
        });
    } else {
        var bu = B.getUnit();
        subunits.push(Units.Unit(bu.getName(),bu.getDimension()));
    }
    if(A.getUnit().type == 'compound') {
        A.getUnit().subunits.forEach(function(su) {
            subunits.push(su);
        });
    } else {
        subunits.push(A.getUnit());
    }

    //reduce
    var finalunits = [];
    finalunits.push(reduceUnits(subunits,'length'));
    finalunits.push(reduceUnits(subunits,'duration'));
    return produceFinalCompound(fval, finalunits);
}

function DivideToCompound(A,B) {
    //console.log("dividing to compound",A.toString(),B.toString());
    var fval = A.getNumber() / B.getNumber();
    var subunits = [];
    if(A.getUnit().type == 'compound') {
        A.getUnit().subunits.forEach(function(su) {
            subunits.push(su);
        });
    } else {
        subunits.push(A.getUnit());
    }
    if(B.getUnit().type == 'compound') {
        B.getUnit().subunits.forEach(function(su) {
            subunits.push(Units.Unit(su.getName(),-su.getDimension()));
        });
    } else {
        var bu = B.getUnit();
        subunits.push(Units.Unit(bu.getName(),-bu.getDimension()));
    }

     //reduce
    var finalunits = [];
    finalunits.push(reduceUnits(subunits,'length'));
    finalunits.push(reduceUnits(subunits,'duration'));
    return produceFinalCompound(fval, finalunits);
}
function findType(arr, type) {
    for(var i=0; i<arr.length; i++) {
        if(arr[i].type == type) return arr[i];
    }
    return null;
}

function convertTypes(aunits, bunits, type) {
    var Atype = findType(aunits,type);
    var Btype = findType(bunits,type);
    if(Atype == null) return 1;
    if(Btype == null) return 1;
    //console.log("A and B",Atype.toString(),Btype.toString());
    if(Atype.getName() == Btype.getName()) {
        //console.log("already the same. do nothing");
        return 1;
    } else {
        //console.log("they are different. must convert", type);
        //console.log("scale = ",Atype.scale, Atype.getDimension());
        var av = Math.pow(Atype.scale,Atype.getDimension());
        var aun = Atype.base;
        //console.log("new value is ", av, aun);
        var uun = Btype.base;
        //console.log("target base is",uun, Btype.scale, Btype.getDimension());
        av = av / Math.pow(Btype.scale,Atype.getDimension());
        aun = uun;
        //console.log("new value is ", av, aun);
        return av;
    }
}
function compoundToCompoundConversion(A,U) {
    //console.log("converting",A._value,A.getUnit().toString(),"to",U.toString());
    var subunits = A.getUnit().subunits.slice();
    var finalunits = [];
    var av = A.getNumber();
    var scale = convertTypes(A.getUnit().subunits,U.subunits,'length');
    av = av * scale;
    //console.log("must scale lengths by",scale,A.getNumber(),av);
    var scale = convertTypes(A.getUnit().subunits,U.subunits,'duration');
    av = av * scale;
    //console.log("must scale durations by",scale,A.getNumber(),av);
    return Literals.makeNumber(av,U);
}
