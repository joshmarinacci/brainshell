var Q = require('q');
var Literals = require('./Literals');

function UnitBase(def) {
    this._name = def.name;
    this._dim = def.dim;
    this.base = def.base;
    this.type = def.type;
    this.scale = def.scale;
    this.getName = function() {
        return this._name;
    };
    this.getDimension = function() {
        return this._dim;
    };
    this.toString = function() {
        if (this._dim == 0) return " " + this.getName();
        return " " + this.getName() + "^" + this.getDimension();
    };
    this.toCode = function() {
        if(this._dim == 0) return "";
        if(this._dim == 1) return this._name;
        return this._name + "^" + this._dim;
    };
    this.value = function () {
        var self = this;
        return Q.fcall(function () {
            return self;
        });
    };

    this.abbrs = [];
    if(def.abbr) this.abbrs.push(def.abbr);
    this.getAbbreviations = function() {
        return this.abbrs;
    }

    if(def.convert) {
        this.convert = def.convert;
    }
}

function Extendo(base,addons) {
    var obj = Object.create(base);
    for(var name in addons) {
        obj[name] = addons[name];
    }
    return obj;
}

//these are the extra plurals and abbreviations.
var names = {
    'inches': 'inch',
    'feet': 'foot',
    'yards': 'yard',
    'miles': 'mile',
    'leagues':'league',

    'teaspoons': 'teaspoon',
    'tablespoons': 'tablespoon',
    'cups': 'cup',
    'pints': 'pint',
    'quarts': 'quart',
    'gallons': 'gallon',

    'acres': 'acre',

    'pounds':'pound',
    'lbs':'pound',
    'ounces':'ounce',

    'sec':'second',
    'seconds':'second',
    'minutes':'minute',
    'hr':'hour',
    'hours':'hour',
    'days':'day',
    'd':'day'

};

names['cubicfoot'] = 'cubicfoot';
names['cuft'] = 'cubicfoot';
names['squarefoot'] = 'squarefoot';
names['sqft'] = 'squarefoot';


//start with the non-metric units, since they aren't uniform
var units = [
    new UnitBase({ name: 'none', type: 'none',   base: 'none',   abbr: '',   scale: 1.0,  dim: 0 }),
    //length
    new UnitBase({ name: 'foot', type: 'length', base: 'meter',  abbr: 'ft', scale: 0.3048, dim: 1 }),
    new UnitBase({ name: 'inch', type: 'length', base: 'meter',  abbr: 'in', scale: 0.0254, dim: 1 }),

    new UnitBase({ name: 'yard', type: 'length', base: 'meter',  abbr: 'yd', scale: 0.9144, dim: 1 }),
    new UnitBase({ name: 'mile', type: 'length', base: 'meter',  abbr: 'mi', scale: 1609.34,  dim: 1 }),
    new UnitBase({ name: 'league',  type: 'length', base: 'mile',            scale: 3,      dim: 1 }),
    /// volume
    new UnitBase({ name: 'gallon', type: 'volume',  base: 'litre', abbr: 'gal', scale: 3.7854118, dim: 1 }),
    new UnitBase({ name: 'quart',  type:'volume',   base:'gallon', abbr: 'qt',  scale: 1 / 4,     dim: 1 }),
    new UnitBase({ name: 'pint',   type: 'volume',  base: 'gallon',abbr: 'pt',  scale: 1 / 8,     dim: 1 }),
    new UnitBase({ name: 'cup',    type: 'volume',  base: 'gallon', abbr: 'cup', scale: 1 / 16,   dim: 1 }),
    new UnitBase({ name: 'gill',   type: 'volume',  base: 'pint',   abbr: 'gl',  scale: 1 / 4,    dim: 1 }),

    new UnitBase({ name: 'teaspoon', type: 'volume', base: 'cup',   abbr: 'tsp', scale: 1 / 48,   dim: 1 }),
    new UnitBase({ name: 'tablespoon', type: 'volume', base: 'cup', abbr: 'tbsp', scale: 1 / 16,  dim: 1 }),

    //mass
    new UnitBase({ name:'pound', type:'mass', base:'gram',  abbr:'lb', scale: 453.592, dim:1 }),
    new UnitBase({ name:'grain', type:'mass', base:'pound', abbr:'gr', scale: 1/7000,  dim: 1 }),
    new UnitBase({ name:'ounce', type:'mass', base:'pound', abbr:'oz', scale: 1/16,    dim:1 }),
    new UnitBase({ name:'ton',   type:'mass', base:'pound',            scale: 2000,    dim:1 }),
    //area
    new UnitBase({ name:'acre',  type:'area', base:'acre',  abbr:'ac', scale: 1,       dim: 1 }),



    //temperature
    new UnitBase({
        name:'celsius',
        abbr:'C',
        type:'temperature',
        base:'celsius',
        scale:1,
        dim:1,
        convert: function(A) {
            if(A.getUnit().getName() == 'fahrenheit')
                return Literals.makeNumber((A.getNumber()-32) * 100/180,this);
            if(A.getUnit().getName() == 'kelvin')
                return Literals.makeNumber(A.getNumber()-273.15,this);
            throw new Error("CAN'T CONVERT " + A.getUnit().toString() + " to " + this);
        }
    }),

    new UnitBase({
        name:'kelvin',
        abbr:'K',
        type:'temperature',
        base:'celsius',
        scale:1,
        dim:1,
        convert: function(A) {
            if(A.getUnit().getName() == 'celsius')
                return Literals.makeNumber(A.getNumber() + 273.15,this);
            if(A.getUnit().getName() == 'fahrenheit')
                return Literals.makeNumber((A.getNumber()-32)*100/180 + 273.15,this);
            throw new Error("CAN'T CONVERT " + A.getUnit().toString() + " to " + this);
        }
    }),
    new UnitBase({
        name:'fahrenheit',
        abbr:'F',
        type:'temperature',
        base:'celsius',
        scale:1,
        dim:1,
        convert: function(A) {
            if(A.getUnit().getName() == 'celsius')
                return Literals.makeNumber((A.getNumber() * 180/100) + 32,this);
            if(A.getUnit().getName() == 'kelvin')
                return Literals.makeNumber((A.getNumber() - 273.15)*180/100 + 32,this);
            throw new Error("CAN'T CONVERT " + A.getUnit().toString() + " to " + this);
        }
    }),


    //time durations
    new UnitBase({
        name:'second',
        abbr:'s',
        type:'duration',
        base:'second',
        scale:1,
        dim:1
    }),
    new UnitBase({
        name:'minute',
        abbr:'min',
        type:'duration',
        base:'second',
        scale:60,
        dim:1
    }),
    new UnitBase({
        name:'hour',
        abbr:'h',
        type:'duration',
        base:'second',
        scale:60*60,
        dim:1
    }),
    new UnitBase({
        name:'day',
        abbr:'d',
        type:'duration',
        base:'second',
        scale:60*60*24,
        dim:1
    }),



    //number formats
    new UnitBase({
        name:'hexadecimal',
        abbr:'hex',
        type:'numeric',
        base:'decimal',
        scale:1,
        dim:1
    })
];

function addUnit(unit) {
    var u = new UnitBase(unit);
    units.push(u);
    names[u.getName() + 's'] = u.getName();
}

function genMetricLen(name, abbr, scale) {
    addUnit({
        name:  name,
        type: 'length',
        base: 'meter',
        abbr:  abbr,
        scale: scale,
        dim:   1
    });
}

genMetricLen('megameter',  'Mm',  1000000);
genMetricLen('kilometer',  'km',  1000);
genMetricLen('hectometer', 'hm',  100);
genMetricLen('decameter',  'dam', 10);
genMetricLen('meter',      'm',   1);
genMetricLen('decimeter',  'dm',  0.1);
genMetricLen('centimeter', 'cm',  0.01);
genMetricLen('millimeter', 'mm',  0.001);
genMetricLen('micrometer', 'um',  0.000001);
genMetricLen('nanometer',  'nm',  0.00000000001);


function genMetricVol(name, abbr, scale) {
    addUnit({
        name: name,
        type: 'volume',
        base: 'litre',
        abbr: abbr,
        scale: scale,
        dim: 1
    });
}

genMetricVol('megalitre',  'Ml', 1000*1000);
genMetricVol('kilolitre',  'kl', 1000);
genMetricVol('hectolitre', 'hl', 100);
genMetricVol('decalitre', 'dal', 10);
genMetricVol('litre',       'l', 1);
genMetricVol('decilitre',  'dl', 0.1);
genMetricVol('centilitre', 'cl', 0.01);
genMetricVol('millilitre', 'ml', 0.001);
genMetricVol('microlitre', 'ul', 0.000001);

function genMetricMass(name, abbr, scale) {
    addUnit({
        name: name,
        type: 'mass',
        base: 'gram',
        abbr: abbr,
        scale: scale,
        dim: 1
    });
}

genMetricMass('megagram',   'Mg', 1000*1000);
genMetricMass('kilogram',   'kg', 1000);
genMetricMass('hectogram',  'hg', 100);
genMetricMass('decagram',  'dag', 10);
genMetricMass('gram',        'g', 1);
genMetricMass('decigram',   'dg', 0.1);
genMetricMass('centigram',  'cg', 0.01);
genMetricMass('milligram',  'mg', 0.001);
genMetricMass('microgram',  'ug',0.000001);

//add in US spellings
names['liter'] = 'litre';
names['liters'] = 'litre';
names['milliliter'] = 'millilitre';
names['milliliters'] = 'millilitre';


var map = {};
units.forEach(function (unit) {
    if(!unit.getName) return;
    map[unit.getName()] = unit;
    //add name and abbr to the name lookup table
    names[unit.getName()] = unit.getName();
    unit.getAbbreviations().forEach(function(abbr){
        names[abbr] = unit.getName();
    });
});


map['cubicfoot'] = new UnitBase({
    name: 'foot',
    type: 'length',
    base: 'meter',
    abbr: 'ft',
    scale: 0.3048,
    dim: 3
});
map['squarefoot'] = new UnitBase({
    name: 'foot',
    type: 'length',
    base: 'meter',
    abbr: 'ft',
    scale: 0.3048,
    dim: 2
});


var unit_modifiers = {
    'cu': 3,
    'cubic': 3,
    'sq': 2,
    'square': 2,
    'squared': 2
};

exports.Unit = function (name, dim, exp) {
    //console.log("making unit",name,dim,exp);
    if(typeof exp !== 'undefined') dim = exp;
    //lower case longer names
    if (name.length >= 3) name = name.toLowerCase();
    if (names[name] && map[names[name]]) {
        var unit = map[names[name]];
        var outunit = Object.create(unit);
        if (unit_modifiers[dim] != null) {
            dim = unit_modifiers[dim];
        }
        if (dim != null) {
            outunit._dim = dim;
        }
        return outunit;
    }
    throw new Error("ERRROR. INVALID UNIT " + name);
};

exports.equal = function (a, b) {
    if(typeof a == 'undefined' && typeof b == 'undefined') return true;
    if(typeof a != 'undefined' && typeof b == 'undefined') return false;
    if(typeof a == 'undefined' && typeof b != 'undefined') return false;

    //all dimensionless units are equal
    if (a._dim == 0 && b._dim == 0) return true;
    if (a._dim == 0 && b.getName()=='none') return true;

    if (a._name == b._name) {
        if (a._dim == b._dim) {
            return true;
        }
    }
    return false;
};


exports.sameName = function (a, b) {
    return (a.getName() == b.getName());
};

exports.sameType = function (a, b) {
    return (a.type == b.type);
};

exports.isValidUnitName = function (name) {
    if (names.hasOwnProperty(name)) return true;
    if (names.hasOwnProperty(name.toLowerCase())) return true;
    return false;
};
exports.isValidUnitModifierName = function (name) {
    if (unit_modifiers.hasOwnProperty(name)) return true;
    return false;
};

exports.hasUnit = function (A) {
    if (typeof A.unit === 'undefined') return false;
    if (A.unit.getName() == 'none') return false;
    return true;
};

