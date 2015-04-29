/**
 * Created by josh on 4/27/15.
 */
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var Symbols = require('../src/Symbols');
var Literals = require("../src/Literals");
var Units = require('../src/Units')
var Context = require('../src/Context');
var test = require('tape');
var ctx = Context.global();

/*
test("multiple blocks", function(t) {
    t.plan(2);
    var expr = Parser.matchAll('4+4;5+5','start');
    t.notEqual(expr,null);
    expr.value(ctx).then(function(v) {
        t.equal(v._value,10);
    }).done();
});
*/
test("notation parsing", function(t) {
    compareNumber(t, "8^2", 64);
    compareNumber(t, "5^3", 125);
    compareNumber(t, "2.2e2", 220);
    compareNumber(t, '2.2E2', 220);
    compareNumber(t, '2e2', 200);
    compareNumber(t, '3e9', 3 * 1000 * 1000 * 1000);
    compareNumber(t, '2e-2', 0.02);
    compareNumber(t, '2*(10^2)', 200);
    compareNumber(t, '2_000_000', 2 * 1000 * 1000);
    compareNumber(t, '50%', 0.5);
    compareNumber(t, '36 * 45%', 36 * 0.45);
    compareNumber(t,'1+2',3);
    compareNumber(t,'1.2+3.4',1.2+3.4);
    compareNumber(t,'1.2-3.4',1.2-3.4);
    compareNumber(t,'1.2*3.4',1.2*3.4);
    compareNumber(t,'1.2/3.4',1.2/3.4);
    compareNumber(t,'4+5+6',15);
    compareNumber(t,'(4+5+6)',15);
    
    
    t.end();
});

test("negative numbers",function(t) {
    compareNumber(t,"-2",-2);
    compareNumber(t,"-2+3",1);
    compareNumber(t,"3+ -2",1);
    compareNumber(t,'3 + -1.5',1.5);
    compareNumber(t,'-1.5 * 3',-1.5*3);
    compareNumber(t,"-1",-1);
    compareNumber(t,'1-2',-1);
    compareNumber(t,'1+-2',-1);
    compareNumber(t,'1 + -2',-1);
    compareNumber(t,'1 * -2',-2);
    //compareNumber(t,'1 * - (3+5)',-8);
    compareNumber(t,'1 - (3+5)',-7);
    t.end();
});

test("precedence",function(t) {
    compareNumber(t,"(4)",4);
    compareNumber(t,"(4)",4);
    compareNumber(t,"(4+5)",9);
    //compareNumber(t,"(4+5*3)",19);
    compareNumber(t,"(4 * 5 + 3)",23);
    compareNumber(t,"(1+(2*3))",7);
    compareNumber(t,"((1+2)*3)",9);
    //compareNumber(t,"((1+1)*(2+2))",(1+1)*(2+2));
    compareNumber(t,"(5+(6*7))",5+(6*7));
    compareNumber(t,"(5+((6*7)))",5+(6*7));
    //compareNumber(t,"((1+5)*((6*8)+(7+6)))",(1+5)*((6*8)+(7+6)));
    t.end();
});

test("weight units", function(t) {
    //weight
    //compareUnit(t,"50g",50,'gram');
    //compareUnit("50kg",  { value:50, unit:'kilograms'});
    //testEval("50lbs", { value:50, unit:'pounds'});
    //testEval('50oz',  { value:50, unit:'ounces'});
    //testEval('50lbs in grams', { value:22679.6,  unit:'grams'});
    //testEval('50oz in grams',  { value:1417.475, unit:'grams'});
    //testEval('1oz + 1lbs', { value:481.94149999999996, units:'grams'});
    t.end();
});

test("area units", function(t) {
    //area
    //tu('10sqm',10,'meterssquared','area');
    //tu('25sqmi',25,'milessquared','area');
    //tu('9sqft',9,'feetsquared','area');
    //tu('9ft * 8m',21.9456,'meterssquared','area');
    //tu('8m * 9ft',21.9456,'meterssquared','area');
    //tu('3ft * 6ft',18,'feetsquared','area');
    //tu('(3ft * 6ft) in sqmi',0,'milessquared','area');
    //tu('1000ac',1000,'acres','area');
    //tu('1000ac in sqm',1000*4046.8564224,'meterssquared','area');
    //tu('40acres in sqmi',0.0625,'milessquared','area');
    //tu('25sqmi + 1000acres',68796559.1808,'meterssquared','area');
    //tu('10m^2',10,'metersquared','area');

    t.end();
});

test("velocity units", function(t) {
    //velocity
    //    tu('5meterspersecond',5,'meterspersecond','velocity');
    //    tu('60mph',60,'milesperhour','velocity');
    //    tu('60mph in kph',96.5606,'kilometersperhour','velocity');
    //    tu('5meterspersecond in mph',5/0.44704,'milesperhour','velocity');
    //tu('5mps',5,'meterpersecond','velocity');
    //tu('60mph in m/s',0,'meterpersecond','velocity');

    t.end();
});

test("acceleration units", function(t) {
    //acceleration
    //tu('9.8mpssq',9.8,'meterpersecondsquared','acceleration');
    //tu('9.8m/s^2',9.8,'meterpersecondsquared','acceleration');
    t.end();
});

test("volume units", function(t) {
    //volume
    //    tu('5gal',5,'gallons','volume');
    //    tu('5cups',5,'cups','volume');
    //    tu('5gal in cups',5*16,'cups','volume');
    //    tu('3tbsp',3,'tablespoons','volume');
    //    tu('3tsp',3,'teaspoons','volume');
    //    tu('3l',3,'liters','volume');
    //    tu('3ml',3,'milliliters','volume');
    //    tu('3ml in liters',0.003,'liters','volume');
    //    tu('3tsp in tablespoons',1.0,'tablespoons','volume');
    //    tu('3tbsp in teaspoons',9,'teaspoons','volume');
    //    tu('21cuft',21,'cubicfoot','volume');
    //tu('3cc',3,'centimetercubed','volume');
    //tu('3cc',3,'milliliter','volume');
    //tu('3ft * 3ft * 3ft',21,'footcubed','volume');
    //tu('(3ft * 3ft * 3ft) in gallon',21,'gallon','volume');
    t.end();
});

test("angle units", function(t) {
    //    testEval('45radians', { value:45, unit:'radians'});
    //    testEval('45deg',     { value:45, unit:'degrees'});
    //    testEval('45deg in radians', { value:45*Math.PI/180.0,unit:'radians'});
    //    testEval('180deg in radians', { value:Math.PI, unit:'radians'});
    t.end();
});

test("temperature units", function(t) {
    //temperature
    //    tu('24C', 24,'celsius','temperature');
    //    tu('24F', 24,'fahrenheit','temperature');
    //tu("temperature(24,unit:'celsius')",24,'celsius','temperature');
    //    tu("24C in fahrenheit",75.2,'fahrenheit','temperature');
    //    tu("400K in celsius",126.85,'celsius','temperature');

    t.end();
});

test("duration units", function(t) {
//duration
//    tu('3hr',3,'hours','duration');
//    tu('30min',30,'minutes','duration');
//    tu('3.8hr in seconds',3.8*60*60,'seconds','duration');
//    tu('100000s in days',100000/(60*60*24),'days','duration');
//    tu('3hr + 30min',3.5*60*60,'seconds','duration');
//    tu('3hr + 30min in minutes',3*60+30,'minutes','duration');
//    tu("date('august 31st, 1975')", moment([1975,8-1,31]),'date','date');
//    tu("date(year:1975)",moment('1975','YYYY'),'date','date');
//    tu("date('1975-08-31',format:'YYYY MM DD')",moment([1975,8-1,31]),'date','date');
    t.end();
});

test("time units", function(t) {
    //time
    //tu('1800 in date',1800,'year','time');
    //tu('1820 in date',1820,'year','time');
    //tu("date('Sept 26th, 2014')",-1,'date','time');
    //tu("time('12:30')",-1,'time','time');
    //tu("time('13:30')",-1,'time','time');
    //tu("time('1:30 pm')",-1,'time','time');
    //tu("time('8:30 pm') - time('6:30 am')",-1,'time','duration');
    //tu("date('Sept 18th 2000') - date('Sept 14th 1900')",-1,'year','duration');
    //tu("(date('Sept 18th 2000') - date('Sept 14th 1900')) in day",-1,'day','duration');

    t.end();
});

test("length units", function(t) {
    compareUnit(t,'40m',40,'meter');
    compareUnit(t,"40m as feet",131.234,'foot');
    //compareUnit(t,'8^2',64,'none');
    //compareUnit(t,'8ft^2',64,'meter',3);
    //testval2('1ft^3',1,Unit('foot',3));
    //compareUnit(t,"40 C",40,'celsius');
    //compareUnit("40 C as Kelvin",40,'kelvin');
    //compareUnit("42 square miles",42,'mile',2);
    //compareUnit("42 sqmi",42,'mile',2);
    //compareUnit("42 mi^2",42,'mile',2);
    //compareUnit("42 mi/hr",42,'mile per hour');

//length
    compareUnit(t,"50mm", 50,'millimeters',1);
    compareUnit(t,"50in", 50, 'inches');
    //compareUnit(t,"50in * 5", 50*5,'inches');
    //compareUnit(t,"50 * 5in", 50*5,'inches');
    //compareUnit(t,"500m + 1km", 1500,'meters');
    t.end();
});

test("format parsing",function(t) {
    //compareUnit("42",42,"decimal");
    //compareFormat("0xFFCC88",0xFFCC88,'hex');
    //compareFormat("42 as hex",42,"hex");
    //compareFormat("42 as octal",42,"octal");
    //compareFormat("42 as binary",42,"binary");
    //compareFormat("0xBEEF as decimal",0xBEEF,'decimal');
    t.end();
});

test("conversions", function(t) {
    //compareUnit("5lbs + 4oz",5.2,"pounds");
    //compareUnit("5lbs + 4g as kilograms",5.2,"kilograms");
    //compareUnit("42 square miles as acres",42,"acre");
    //compareUnit("200ft * 300ft as acres",42,"acre");
    t.end();
});

    /*
    testEval("'foo'","foo");
//table data tests
    testEval("42",42);
    testEval("[42]",[42]);
    testEval("[42,88,128]",[42,88,128]);
    testEval("[21*2,88,128]",[42,88,128]);
    testEval("[2+40,80+8,128]",[42,88,128]);
    testEval("[ [0,1], [2,3] ]",[[0,1],[2,3]]);

//named columns in tables
    testEval('[x:1]',{x:1});
    testEval('[x:1+2]',{x:3});
    testEval("[[q:5,r:6],[j:7,k:8]]",[ {q:5,r:6}, {j:7,k:8}]);
    testEval("[[q:5+5,r:6*1],[j:7*2,k:(8-3)]]",[ {q:5+5,r:6*1}, {j:7*2,k:8-3}]);

//symbol resolution
    know.global.testval = 678;
    testEval('testval',678);
    testEval('math.pi',Math.PI);

//function calls
    testEval("math.cos(0)",1);
    testEval("math.sin(1)",Math.sin(1));
    testEval("math.sin(1*2)",Math.sin(1*2));
    testEval("math.sin(1+2)",Math.sin(1+2));

//functions with table args
    testEval("stats.min([1,2,3,4,5,6,7,8,9,10])",1);
    testEval("stats.sum([1,2,3,4,5,6,7,8,9,10])",11*5);
    testEval("stats.max([1,2,3,4,5,6,7,8,9,10])",10);
    testEval("stats.mean([1,2,3,4,5,6,7,8,9,10])",5.5);
    testEval("stats.stddev([2,4,4,4,5,5,7,9])",2);


//function calls with named args
    testEval("foo.sum(5,8,10+3,bar:0+3*2,baz:1,qux:2)",5+8+10+3+(3*2)+1+2);
//function calls
    testEval("(foo.sum(8,7)-foo.sum(6))",9);
    testEval("foo.sum(8,7)-foo.sum(6)",9);

//variable assignment
    testEval("x = 1",1);

    testEval("x",1);
    testEval("1+1",2);
    testEval("x+1",2);
    testEval('1+x',2);
    testEval("var = 42",42);
    testEval("var2 = 40+2",42);
    testEval('varx2z = 42',42);

    testEval("bar =23",23);
    testEval("bar= 23",23);
    testEval("bar=23",23);

    testEval("a = x",1);
    testEval("a",1);
    testEval("foox =[1,2,3]",[1,2,3]);
    testEval("foox",[1,2,3]);
    testEval("x = [42,88,128]",[42,88,128]);
    testEval("x",[42,88,128]);
    testEval("data = [48-6,88,128]",[42,88,128]);
    testEval("data = [48-6,88,129]",[42,88,129]);
    testEval("data",[42,88,129]);
    testEval("data = [48-6,88,128]",[42,88,128]);


//variable resolution and evaluation
    testEval("cats = 2",2);
    testEval("cans = 3",3);
    testEval("cans /cats",3/2);





//multi-column data
    testEval("x = 5",5);
    testEval("x = [5,6,7,8]",[5,6,7,8]);
    testEval("[[5,6],[7,8]]",[[5,6],[7,8]]);
    testEval("x = [[5,6],[7,8]]",[[5,6],[7,8]]);
    testEval("data2 = [[40,50],[100,60],[90,20]]",[[40,50],[100,60],[90,20]]);
    testEval("[[q:5,r:6],[j:7,k:8]]",[ {q:5,r:6}, {j:7,k:8}]);
    testEval("[[q:5,r:6],[q:8,r:9]]",[ {q:5,r:6}, {q:8, r:9}]);
    testEval("filter( [ [q:5,r:6], [q:8,r:9], [q:3,r:3]], cond:(x.q>6))",[ {q:8, r:9}]);
    testEval("filter([[q:5,r:6],[q:8,r:9],[q:3,r:3]], cond:(x.q>2), key:'q')",[ 5,8,3]);
    testEval("filter( [ [number:115, weight:288], [number:114, weight:100]], cond:(x.number<115))",[{number:114,weight:100}]);
    testEval("[[x:5,r:6],[j:7,k:8]]",[ {x:5,r:6}, {j:7,k:8}]);


    testEval("[5:6]",{5:6});
    testEval("graph([1:2, 1:3, 2:4, 1:4])",null);


//data loading and parsing
    testEval("data1 = load('fake')",[1,2,3]);
    testEval("data1",[1,2,3]);
    testEval("[1,2,3]",[1,2,3]);
    testEval("[,1,2,3,]",[1,2,3]);

//image data
    testEval("img = image.loadImage('earth.png')",null);
    testEval("image.getPixel(0,0, img)",{r:0,g:0,b:192,a:0});
    testEval("image.getPixel(10,10, img)",{r:0,g:0,b:0,a:0},false);
    testEval("image.getPixel(0,0, image.grayscale(img))",{r:64,g:64,b:64,a:0});
    testEval("image.getPixel(0,0, image.rescale(img, r:0, g:0, b:1))",{r:0,g:0,b:1});

    //length
    tu('3ft + 6ft',2.7432,'meters','length');
    tu('(3ft + 6ft) in feet',9,'feet','length');
    tu('20000leagues in miles',60*1000,'miles','length');

     */
//});

/*
test("arithmetic parsing", function(t) {
    testval2('4 + 5',9);
    testval2('4+5',9);
    testval2('4.8 + 5',9.8);
    testval2('4ft+5ft',9,Unit('ft'));
    //testval2('4ft+5',9);  //should error
    testval2('4ft*5ft',20,Unit('ft',2));
    testval2('4ft * 5',20,Unit('ft',1));
    testval2('4ft * 5ft as square meters', 1.85806,Unit('meter',2));
    testval2('4ft * 5ft * 6ft', 4*5*6,Unit('foot',3));
    testval2('4ft - 5ft',4-5,Unit('ft'));
    testval2('4ft * 5ft * 6ft as gal',897.662,Unit('gallon',1));
    testval2('4',4,Unit('none'));
    testval2('4.5',4.5,Unit('none'));
    testval2('4ft as in',4*12,Unit('inch'));
    testval2('4.5 ft as in',4.5*12,Unit('inch'));


    testval2('4 qt',4,Unit('quart'));
    testval2('4 pt',4,Unit('pint'));
    testval2('4 qt as gallon',1,Unit('gallon'));
    testval2('4 pt as gallon',0.5,Unit('gallon'));


    testval2('3 mi',3,Unit("mile"));
    testval2('3 miles',3,Unit("mile"));
    testval2('3 mi as km',4.82803,Unit('kilometers'));
});

test("unit parsing", function(t){
    testval2('6ft + 5ft', 11, Unit('feet'));
    testval2('1 ft + 2ft + 3ft', 6, Unit('feet'));
    testval2('1 + 2 + 3 + 4', 10, Unit('none'));

    testval2('1 + 2 * 3 + 4', 13, Unit('none'));
    testval2('4ft - 5ft', -1, Unit('feet'));
    testval2('4ft * 5ft', 20, Unit('feet',2));
    testval2('4ft / 2ft',  2, Unit('none'));
    testval2('4 + 5 + 6', 15, Unit('none'));
    testval2('4 + 5 * 6', 54, Unit('none'));
    testval2('(4+5) * 6', 54, Unit('none'));
    testval2('4 + (5*6)', 34, Unit('none'));
    testval2('(1+2)*(3+4)', 21, Unit('none'));
    testval2('1ft * 2ft * 3ft', 6, Unit('feet',3));
    testval2('4ft as meter',1.2192,Unit('meter'));
    testval2('4ft as m',1.2192,Unit('meter'));
    testval2('4ft as meters',1.2192,Unit('meter'));
    testval2('4ft as inch',4*12,Unit('inch'));
    testval2('4ft', 4, Unit('ft'));
    testval2('4ft/2',2,Unit('feet'));
    testval2('4ft/2ft',2,Unit('none'));
    testval2('4ft/2m',0.6096,Unit('none'));
    //testval2('4ft/2gal',2,Unit('none'));//should error
    testval2('(4+5)*6',(4+5)*6,Unit('none'));
    testval2('4+5*6',(4+5)*6,Unit('none'));
    testval2('4+(5*6)',4+(5*6),Unit('none'));
    //testval2('4ft - 2gal');//should error
    testval2('4ft * 2sqft',8,Unit('feet',3));
    testval2('4m + 12ft',4 + 3.6576,Unit('m'));
    testval2('4mm + 12ft',4 + (3.6576/0.001),Unit('mm'));
    testval2('40mm + 40cm + 4m',4440,Unit('mm'));
    testval2('4 l',4,Unit('liter'));
    testval2('4ml',4,Unit('ml'));
    testval2('1l as gal',0.264172,Unit('gal'));
    testval2('4l + 3gal',4+11.3562,Unit('litre'));
    testval2('1l + 15l as ml',16*1000,Unit('ml'));
    testval2('(4l + 3gal) as ml',(4+3*3.7854118)*1000,Unit('millilitre'));

    testval2('48tsp as cups',1,Unit('cup'));
    testval2('16tbsp as cups',1,Unit('cup'));
    testval2('16cups as gal',1,Unit('gal'));
    testval2('1tsp as gal',0.00130208,Unit('gal'));
    testval2('1tsp as liter',0.00492892,Unit('liter'));
    testval2('1tsp as ml',4.92892,Unit('ml'));
    testval2('4ml as tsp',0.811537,Unit('tsp'));
    testval2('4ml as tbsp',0.270512,Unit('tbsp'));
    testval2('3 cups + 1 cups',4,Unit('cups'));

    testval2('2ft/2',1,Unit("feet"));
    testval2('2/2ft',1,Unit("feet"));
    testval2('2ft*2',4,Unit("feet"));
    testval2('2*2ft',4,Unit("feet"));
    testval2('1/2 cups',0.5,Unit('cups'));
    testval2('3 cups + (1/2cups)',3.5,Unit('cups'));
    testval2('1ft * 2ft * 3ft', 6, Unit('feet',3));
    testval2('1ft * 2ft * 3ft as liter', 169.901, Unit('liter'));
    testval2('1m * 2m * 3m as liter', 6000, Unit('liter'));
    testval2('4ft * 5ft * 6ft as gallon',897.662,Unit('gallon'));

    testval2('4 cuft', 4, Unit('feet',3));
    testval2('4 cu ft', 4, Unit('feet',3));
    testval2('4 sq ft', 4, Unit('feet',2));
    testval2('4 cubic feet', 4, Unit('feet',3));
    //testval2('4 ft^3', 4, Unit('feet',3));
    testval2('4 cuft as gal', 29.9221, Unit('gal',1));

    testval2('8 acres',8,Unit('acre',1));
    testval2('1m * 2m as acre',0.000494211,Unit('acre'));
    testval2('1km * 2km as acre',494.211,Unit('acre'));
    //testval2('4 cuft as tsp',0,Unit('tsp'));
    testval2('1m * 2m as squared feet',21.5278,Unit('feet',2));
    testval2('1m * 2m as sq ft',21.5278,Unit('feet',2));
    testval2('1m * 2m as sqft',21.5278,Unit('feet',2));

    testval2('4ft as in',4*12,Unit('inch'));

})
*/

/*
test("symbol with _ in it", function(t) {
    t.plan(3);
    var sym = Symbols.make('foo_bar');
    sym.update(Literals.makeNumber(22));
    ctx.register(sym);
    parse("foo_bar").value().then(function(v) {  t.equal(v._value,22); }).done();
    parse("foo_bar + 5").value().then(function(v) { t.equal(v._value,22+5); });
    parse("5 + foo_bar + 5").value().then(function(v) { t.equal(v._value,5+22+5); });
});
*/



/*
test("variable equations", function(t) {
    compareUnit("pi * (42m)^2",Math.PI*42*42,'meter');
    compareUnit("ca_pop/ca_area",42,"person per square mile");
    compareUnit("earth_circ/700 mi/hr",42,"hours");
    // how earths could fit inside of jupiter
    compareUnit("(4/3 * pi * jupiter_radius^2) / (4/3 * pi * earth_radius)",42);
});
*/


function parse(str) {
    return Parser.matchAll(str,'start');
}
function compareNumber(t,str,val) {
    var epsilon = 0.000000001;
    parse(str).value().then(function(v){
        if(Math.abs(val-v._value) > epsilon) {
            t.fail("not equal " + val + " " +v._value);
        }
    });
}
function compareUnit(t,str,val,unit,dim) {
    if(!dim) dim = 1;
    var epsilon = 0.01;
    parse(str).value().then(function(v){
        if(Math.abs(val-v._value) > epsilon) {
            t.fail("not equal " + val + " " +v._value);
        }
        //console.log(v.getUnit().toString())
        //console.log("unit is",Units.equal(v.getUnit(),Units.Unit(unit,dim)));
        if(v.hasUnit() == false) t.fail('unit is missing');
        //t.equal(v.hasUnit(),true);
        //console.log("test unit",unit,'^',dim);
        t.ok(Units.equal(v.getUnit(),Units.Unit(unit,dim)),v.getUnit().toString());
    }).done();
}

