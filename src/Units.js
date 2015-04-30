var Q = require('q');

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
    {
        name: 'none',
        type: 'none',
        base: 'none',
        abbr: '',
        scale: 1.0,
        dim: 0
    },


    //length
    {
        name: 'foot',
        type: 'length',
        base: 'meter',
        abbr: 'ft',
        scale: 0.3048,
        dim: 1
    },
    {
        name: 'inch',
        type: 'length',
        base: 'meter',
        abbr: 'in',
        scale: 0.0254,
        dim: 1
    },
    {
        name: 'yard',
        type: 'length',
        base: 'meter',
        abbr: 'yd',
        scale: 0.9144,
        dim: 1
    },
    {
        name: 'mile',
        type: 'length',
        base: 'meter',
        abbr: 'mi',
        scale: 1609.34,
        dim: 1
    },
    {
        name: 'league',
        type: 'length',
        base: 'mile',

        scale: 3,
        dim: 1
    },


    /// volume

    {
        name: 'gallon',
        abbr: 'gal',
        type: 'volume',
        base: 'litre',
        scale: 3.7854118,
        dim: 1
    },
    {
        name: 'quart',
        abbr: 'qt',
        type: 'volume',
        base: 'gallon',
        scale: 1 / 4,
        dim: 1
    },
    {
        name: 'pint',
        abbr: 'pt',
        type: 'volume',
        base: 'gallon',
        scale: 1 / 8,
        dim: 1
    },
    {
        name: 'cup',
        abbr: 'cup',
        type: 'volume',
        base: 'gallon',
        scale: 1 / 16,
        dim: 1
    },
    {
        name: 'gill',
        abbr: 'gl',
        type: 'volume',
        base: 'pint',
        scale: 1 / 4,
        dim: 1
    },

    {
        name: 'teaspoon',
        abbr: 'tsp',
        type: 'volume',
        base: 'cup',
        scale: 1 / 48,
        dim: 1
    },
    {
        name: 'tablespoon',
        abbr: 'tbsp',
        type: 'volume',
        base: 'cup',
        scale: 1 / 16,
        dim: 1
    },


    //mass
    {
        name:'pound',
        abbr:'lb',
        type:'mass',
        base:'gram',
        scale: 453.592,
        dim:1
    },
    {
        name:'grain',
        abbr:'gr',
        type:'mass',
        base:'pound',
        scale: 1/7000,
        dim: 1
    },
    {
        name:'ounce',
        abbr:'oz',
        type:'mass',
        base:'pound',
        scale: 1/16,
        dim: 1
    },
    {
        name:'ton',
        type:'mass',
        base:'pound',
        scale: 2000,
        dim:1
    },



    //area
    {
        name: 'acre',
        abbr: 'acre',
        type: 'area',
        base: 'acre',
        scale: 1,
        dim: 1
    },



    //temperature
    {
        name:'celsius',
        abbr:'C',
        type:'temperature',
        base:'celsius',
        scale:1,
        dim:1
    },
    {
        name:'kelvin',
        abbr:'K',
        type:'temperature',
        base:'celsius',
        scale:1,
        dim:1
    },
    {
        name:'fahrenheit',
        abbr:'F',
        type:'temperature',
        base:'celsius',
        scale:1,
        dim:1
    },


    //time durations
    {
        name:'second',
        abbr:'s',
        type:'duration',
        base:'second',
        scale:1,
        dim:1
    },
    {
        name:'minute',
        abbr:'min',
        type:'duration',
        base:'second',
        scale:60,
        dim:1
    },
    {
        name:'hour',
        abbr:'h',
        type:'duration',
        base:'second',
        scale:60*60,
        dim:1
    },
    {
        name:'day',
        abbr:'d',
        type:'duration',
        base:'second',
        scale:60*60*24,
        dim:1
    },
];


function genMetricLen(name, abbr, scale) {
    var unit = {
        name: name,
        type: 'length',
        base: 'meter',
        abbr: abbr,
        scale: scale,
        dim: 1
    };

    units.push(unit);
    names[unit.name] = unit.name;
    names[unit.name + 's'] = unit.name;
    names[unit.abbr] = unit.name;
}

genMetricLen('megameter', 'Mm', 1000000);
genMetricLen('kilometer', 'km', 1000);
genMetricLen('hectometer', 'hm', 100);
genMetricLen('decameter', 'dam', 10);
genMetricLen('meter', 'm', 1);
genMetricLen('decimeter', 'dm', 0.1);
genMetricLen('centimeter', 'cm', 0.01);
genMetricLen('millimeter', 'mm', 0.001);
genMetricLen('micrometer', 'um', 0.000001);
genMetricLen('nanometer', 'nm', 0.00000000001);


function genMetricVol(name, abbr, scale) {
    var unit = {
        name: name,
        type: 'volume',
        base: 'litre',
        abbr: abbr,
        scale: scale,
        dim: 1
    };

    units.push(unit);
    names[unit.name] = unit.name;
    names[unit.name + 's'] = unit.name;
    names[unit.abbr] = unit.name;
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
    var unit = {
        name: name,
        type: 'mass',
        base: 'gram',
        abbr: abbr,
        scale: scale,
        dim: 1
    }

    units.push(unit);
    names[unit.name] = unit.name;
    names[unit.name + 's'] = unit.name;
    names[unit.abbr] = unit.name;
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

function UnitToString() {
    if (this.dim == 0) return " " + this.name;
    return " " + this.name + "^" + this.dim;
}

var map = {};
units.forEach(function (unit) {
    //put into the map
    map[unit.name] = unit;
    unit.toString = UnitToString;
    unit.value = function () {
        var self = this;
        return Q.fcall(function () {
            return self;
        });
    };
    //add name and abbr to the name lookup table
    names[unit.name] = unit.name;
    names[unit.abbr] = unit.name;
});


map['cubicfoot'] = {
    name: 'foot',
    type: 'length',
    base: 'meter',
    abbr: 'ft',
    scale: 0.3048,
    dim: 3,
    toString: UnitToString
};
map['squarefoot'] = {
    name: 'foot',
    type: 'length',
    base: 'meter',
    abbr: 'ft',
    scale: 0.3048,
    dim: 2,
    toString: UnitToString
};


var unit_modifiers = {
    'cu': 3,
    'cubic': 3,
    'sq': 2,
    'square': 2,
    'squared': 2
};

exports.Unit = function (name, dim) {
    //console.log("making unit",name,dim);
    if (names[name] && map[names[name]]) {
        var unit = map[names[name]];
        var outunit = Object.create(unit);
        if (unit_modifiers[dim] != null) {
            dim = unit_modifiers[dim];
        }
        if (dim != null) {
            outunit.dim = dim;
        }
        return outunit;
    }
    console.log("ERRROR. INVALID UNIT", name);
    return null;
};

exports.equal = function (a, b) {
    if(typeof a == 'undefined' && typeof b == 'undefined') return true;
    //all dimensionless units are equal
    if (a.dim == 0 && b.dim == 0) return true;

    if (a.name == b.name) {
        if (a.dim == b.dim) {
            return true;
        }
    }
    return false;
};


exports.sameName = function (a, b) {
    return (a.name == b.name);
};

exports.sameType = function (a, b) {
    return (a.type == b.type);
};

exports.isValidUnitName = function (name) {
    if (names.hasOwnProperty(name)) return true;
    return false;
};
exports.isValidUnitModifierName = function (name) {
    if (unit_modifiers.hasOwnProperty(name)) return true;
    return false;
};

exports.hasUnit = function (A) {
    if (typeof A.unit === 'undefined') return false;
    if (A.unit.name == 'none') return false;
    return true;
};

