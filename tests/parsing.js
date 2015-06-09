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
//foo2
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

test("format parsing",function(t) {
    //compareFormat(t,"42",42,"decimal");
    //compareFormat(t,"x42",42,"hex");
    //compareFormat("0xFFCC88",0xFFCC88,'hex');
    //compareFormat("42 as hex",42,"hex");
    //compareFormat("42 as octal",42,"octal");
    //compareFormat("42 as binary",42,"binary");
    //compareFormat("0xBEEF as decimal",0xBEEF,'decimal');
    t.end();
});

function regSymbol(name,val) {
    var sym = Symbols.make(name);
    sym.update(Literals.makeNumber(val));
    ctx.register(sym);
}
regSymbol('PI',Math.PI);
regSymbol('E',Math.E);
regSymbol('earth_circumference',24901);
regSymbol('earth_radius',3959);

test("constants", function(t){
    compareNumber(t,'PI',Math.PI);
    compareNumber(t,'E',Math.E);
    compareNumber(t,'earth_circumference',24901);
    compareNumber(t,'earth_radius',3959);
    //575mph is cruising speed of long haul airliner
    t.end();
});

test("notation parsing", function(t) {
    compareNumber(t, "8^2", 64);
    compareNumber(t, "5^3", 125);
    compareNumber(t, "2.2e2", 220);
    compareNumber(t, '2.2E2', 220);
    //compareNumber(t, '2.2E10', 22000000); // this currently fails
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
    compareNumber(t,'4*5',20);
    compareNumber(t,'4 + 5',9);
    compareNumber(t,'4+5',9);
    compareNumber(t,'4.8 + 5',9.8);
    compareUnit(t,'4ft+5ft',9,'ft');
    compareUnit(t,'4ft*5ft',20,'ft',2);
    compareUnit(t,'4ft * 5',20,'ft',1);
    compareUnit(t,'4ft * 5ft as square meters', 1.85806,'meter',2);
    compareUnit(t,'4ft * 5ft * 6ft', 4*5*6,'foot',3);
    compareUnit(t,'4ft - 5ft',4-5,'ft');
    compareUnit(t,'4ft * 5ft * 6ft as gal',897.662,'gallon',1);
    compareUnit(t,'4ft as in',4*12,'inch');
    compareUnit(t,'4.5 ft as in',4.5*12,'inch');
    compareUnit(t,'4ft',4,'ft',1);
    compareUnit(t,'(4ft)',4,'ft',1);
    compareUnit(t,'4ft^2',4,'ft',2);
    compareUnit(t,'(4ft)^2',16,'ft',1);
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
    compareNumber(t,"((1+1)*(2+2))",(1+1)*(2+2));
    compareNumber(t,"(5+(6*7))",5+(6*7));
    compareNumber(t,"(5+((6*7)))",5+(6*7));
    compareNumber(t,"((1+5)*((6*8)+(7+6)))",(1+5)*((6*8)+(7+6)));
    t.end();
});

test("length units", function(t) {
    compareUnit(t,'40m',40,'meter');
    compareUnit(t,"40m as feet",131.234,'foot');
    compareUnit(t,"42 square miles",42,'mile',2);
    compareUnit(t,"42 sq mi",42,'mile',2);
    compareUnit(t,"50mm", 50,'millimeters',1);
    compareUnit(t,"50in", 50, 'inches');
    compareUnit(t,"50in * 5", 50*5,'inches');
    compareUnit(t,"50 * 5in", 50*5,'inches');
    compareUnit(t,"1km+500m", 1500,'meters');
    compareUnit(t,'3ft + 6ft as meters',2.7432,'meters');
    compareUnit(t,'(3ft + 6ft) as feet',9,'feet');
    compareUnit(t,'20000 leagues',20*1000,'league');
    compareUnit(t,'20000 leagues as miles',60*1000,'miles');
    compareUnit(t,'3 mi',3,"mile");
    compareUnit(t,'3 miles',3,"mile");
    compareUnit(t,'3 mi as km',4.82803,'kilometers');
    compareUnit(t,'2ft/2',1,"feet");
    compareUnit(t,'2/2ft',1,"feet");
    compareUnit(t,'2ft*2',4,"feet");
    compareUnit(t,'2*2ft',4,"feet");
    compareUnit(t,'1 + 2 + 3 + 4', 10, 'none');
    compareUnit(t,'1 + 2 * 3 + 4', 13,'none');
    compareUnit(t,'4ft - 5ft', -1,'feet');
    compareUnit(t,'4ft * 5ft', 20,'feet',2);
    compareUnit(t,'4ft / 2ft',  2,'none');
    compareUnit(t,'4 + 5 + 6', 15,'none');
    compareUnit(t,'4 + 5 * 6', 54,'none');
    compareUnit(t,'(4+5) * 6', 54,'none');
    compareUnit(t,'4 + (5*6)', 34,'none');
    compareUnit(t,'(1+2)*(3+4)', 21,'none');
    compareUnit(t,'1ft * 2ft * 3ft', 6,'feet',3);
    compareUnit(t,'4ft as meter',1.2192,'meter');
    compareUnit(t,'4ft as m',1.2192,'meter');
    compareUnit(t,'4ft as meters',1.2192,'meter');
    compareUnit(t,'4ft as inch',4*12,'inch');
    compareUnit(t,'4ft', 4,'ft');
    compareUnit(t,'4ft/2ft',2,'none');
    compareUnit(t,'4ft/2m',0.6096,'none');
    //compareUnit(t,'4ft/2gal',3,'none');//should error
    compareUnit(t,'(4+5)*6',(4+5)*6,'none');
    compareUnit(t,'4+5*6',(4+5)*6,'none');
    compareUnit(t,'4+(5*6)',4+(5*6),'none');
    //compareUnit(t,'4ft - 2gal');//should error
    compareUnit(t,'4ft * 2sqft',8,'feet',3);
    compareUnit(t,'4m + 12ft as m',4 + 3.6576,'m');
    compareUnit(t,'4mm + 12ft as mm',4 + (3.6576/0.001),'mm');
    compareUnit(t,'40mm + 40cm + 4m',4.440,'m');
    compareUnit(t,'40 furlongs as mi',40/8,'miles');
    t.end();
});

test("mass units", function(t) {
    compareUnit(t,"50g",50,'gram');
    compareUnit(t,"50kg", 50,'kilograms');
    compareUnit(t,'50lb', 50,'pounds');
    compareUnit(t,'50oz', 50,'ounces');
    compareUnit(t,'50lb as grams',22679.6,'grams');
    compareUnit(t,'50oz as grams',1417.475, 'grams');
    compareUnit(t,'50oz + 60oz',110, 'oz');
    compareUnit(t,'1oz + 1lb',17*1/16.0,'pounds');
    compareUnit(t,'(1oz + 1lb) as grams',481.942,'gram');
    compareUnit(t,'50g * 2',100,'grams');
    compareUnit(t,'50 * 2g',100,'grams');
    compareUnit(t,"5lbs + 4oz",84,"ounces");
    compareUnit(t,"(5lbs + 4g) as kilograms",2.26796,"kilograms");
    compareUnit(t,"5 stone as pounds",5*14,"pounds");
    compareUnit(t,"6 st as pounds",6*14,"pounds");
    t.end();
});

test("area units", function(t) {
    compareUnit(t,'8ft^2',8,'foot',2);
    compareUnit(t,'(8ft)^2',64,'foot',1);
    compareUnit(t,"1 square miles as acres",1*640,"acre");
    compareUnit(t,"200ft * 300ft as acres",1.3774105,"acre");
    compareUnit(t,"42 mi^2",42,'mile',2);
    compareUnit(t,'10 square miles',10,'mile',2);
    compareUnit(t,'10 sq mi',10,'mile',2);
    compareUnit(t,'10 square meters',10,'meter',2);
    compareUnit(t,'10 sq m',10,'meter',2);
    compareUnit(t,'9 sqft',9,'feet',2);
    compareUnit(t,'9ft * 9m',24.6888,'meter',2);
    compareUnit(t,'8m * 9ft',236.2204724,'foot',2);
    compareUnit(t,'3ft * 6ft',18,'foot',2);
    compareUnit(t,'(3ft * 6ft) as sq mi',6.4566e-7,'miles',2);
    compareUnit(t,'1000ac',1000,'acres');
    compareUnit(t,'1000ac as sq m',1000*4046.8564224,'meters',2);
    //compareUnit(t,'40 acres as sq mi',0.0625,'miles',2);
    //compareUnit(t,'25sqmi + 1000acres',68796559.1808,'meters',2);
    compareUnit(t,'10m^2',10,'meter',2);

    compareUnit(t,'8 acres',8,'acre');
    compareUnit(t,'1m * 2m as acre',0.000494211,'acre');
    compareUnit(t,'1km * 2km as acre',494.211,'acre');
    compareUnit(t,'4 cu ft as tsp',22980.2,'tsp');
    compareUnit(t,'1m * 2m as squared feet',21.5278,'feet',2);
    compareUnit(t,'1m * 2m as sq ft',21.5278,'feet',2);
    //compareUnit(t,'1m * 2m as sqft' ,21.5278,'feet',2);
    t.end();
});

test("velocity units", function(t) {
    compareCompoundUnit(t,"42mi/hr",42,['mile',1,'hour',1]);
    compareCompoundUnit(t,"42m/s^2",42,['meter',1,'second',-2]);
    compareCompoundUnit(t,"6s * 7m/s^2 ",42,['meter','1','second',-1]);
    compareCompoundUnit(t,'5m/s',5,['meter',1,'second',-1]);
    compareCompoundUnit(t,'60 mi/hr',60,['mile',1,'hour',-1]);
    compareCompoundUnit(t,'7m/s^2 * 6m',42,['meter',2,'second',-2]);
    compareCompoundUnit(t,'60 mi/hr as km/hr',96.5604,['kilometer',1,'hour',-1]);
    compareCompoundUnit(t,'5 m/s as mi/hr',11.1847,['mile',1,'hour',-1]);
    compareCompoundUnit(t,'60 mi/hr as m/s ',26.8224,['meter',1,'second',-1]);
    t.end();
});

test("acceleration units", function(t) {
    compareCompoundUnit(t,'9.8 m/s^2',9.8,['meter',1,'second',-2]);
    t.end();
});

test("volume units", function(t) {
    compareUnit(t,'5gal',5,'gallons');
    compareUnit(t,'5cups',5,'cups');
    compareUnit(t,'5gal as cups',5*16,'cups');
    compareUnit(t,'3tbsp',3,'tablespoons');
    compareUnit(t,'3tsp',3,'teaspoons');
    compareUnit(t,'3l',3,'liters');
    compareUnit(t,'3ml',3,'milliliters');
    compareUnit(t,'3ml as liters',0.003,'liters');
    compareUnit(t,'3tsp as tablespoons',1.0,'tablespoons');
    compareUnit(t,'3tbsp as teaspoons',9,'teaspoons');
    compareUnit(t,'21 cu ft',21,'cubicfoot');
    compareUnit(t,'3 cm^3',3,'cm',3);
    compareUnit(t,'3 cm^3 as ml',3,'milliliter');
    compareUnit(t,'3ft * 3ft * 3ft',27,'cubicfoot');
    compareUnit(t,'(3ft * 3ft * 3ft) as gallon',201.974,'gallon');
    compareUnit(t,'1ft^3',1,'foot',3);
    compareUnit(t,'4 qt',4,'quart');
    compareUnit(t,'4 pt',4,'pint');
    compareUnit(t,'4 qt as gallon',1,'gallon');
    compareUnit(t,'4 pt as gallon',0.5,'gallon');
    compareUnit(t,'4 l',4,'liter');
    compareUnit(t,'4ml',4,'ml');
    compareUnit(t,'1l as gal',0.264172,'gal');
    compareUnit(t,'4l + 3gal',3+1.05669,'gal');
    compareUnit(t,'1l + 15l as ml',16*1000,'ml');
    compareUnit(t,'(4l + 3gal) as ml',(4+3*3.7854118)*1000,'millilitre');
    compareUnit(t,'48tsp as cups',1,'cup');
    compareUnit(t,'16tbsp as cups',1,'cup');
    compareUnit(t,'16cups as gal',1,'gal');
    compareUnit(t,'1tsp as gal',0.00130208,'gal');
    compareUnit(t,'1tsp as liter',0.00492892,'liter');
    compareUnit(t,'1tsp as ml',4.92892,'ml');
    compareUnit(t,'4ml as tsp',0.811537,'tsp');
    compareUnit(t,'4ml as tbsp',0.270512,'tbsp');
    compareUnit(t,'3 cups + 1 cups',4,'cups');
    compareUnit(t,'1/2 cups',0.5,'cups');
    compareUnit(t,'3 cups + (1/2cups)',3.5,'cups');
    compareUnit(t,'1ft * 2ft * 3ft', 6,'feet',3);
    compareUnit(t,'1ft * 2ft * 3ft as liter', 169.901,'liter');
    compareUnit(t,'1m * 2m * 3m as liter', 6000,'liter');
    compareUnit(t,'4ft * 5ft * 6ft as gallon',897.662,'gallon');
    //compareUnit(t,'4 cuft', 4,'feet',3);
    compareUnit(t,'4 cu ft', 4,'feet',3);
    compareUnit(t,'4 sq ft', 4,'feet',2);
    compareUnit(t,'4 cubic feet', 4,'feet',3);
    compareUnit(t,'4 ft^3', 4,'feet',3);
    compareUnit(t,'8 fluidounce as pints',1/2,'pints');
    compareUnit(t,'32 floz as pints',2,'pints');
    //compareUnit(t,'4 cuft as gal', 29.9221,'gal',1);
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
    compareUnit(t,'24C', 24,'celsius');
    compareUnit(t,'24K', 24,'kelvin');
    compareUnit(t,'24F', 24,'fahrenheit');
    compareUnit(t,"40 C",40,'celsius');
    compareUnit(t,"75 F as C",23.8889,'celsius');
    compareUnit(t,"75 C as F",167,'fahrenheit');
    compareUnit(t,"40 C as kelvin",313.15,'kelvin');
    compareUnit(t,"300 K as celsius",26.85,'celsius');
    compareUnit(t,"300 K as C",26.85,'C');
    compareUnit(t,"24C as fahrenheit",75.2,'fahrenheit');
    compareUnit(t,"24C as Fahrenheit",75.2,'fahrenheit');
    compareUnit(t,"300 K as F",80.33,'F');
    compareUnit(t,"75 F as K",297.039,'K');
    t.end();
});

test("duration units", function(t) {
    compareUnit(t,'3hr',3,'hours');
    compareUnit(t,'30min',30,'minutes');
    compareUnit(t,'3.8hr as seconds',3.8*60*60,'seconds');
    compareUnit(t,'100000s as days',100000/(60*60*24),'days');
    compareUnit(t,'3hr + 30min as seconds',3.5*60*60,'seconds');
    compareUnit(t,'3hr + 30min as minutes',3*60+30,'minutes');
    compareUnit(t,'3 fortnight as days',3*14,'days');
    compareUnit(t,'3 fortnights as days',3*14,'days');
    //compareUnit(t,"date('august 31st, 1975')", moment([1975,8-1,31]),'date','date');
    //compareUnit(t,"date(year:1975)",moment('1975','YYYY'),'date','date');
    //compareUnit(t,"date('1975-08-31',format:'YYYY MM DD')",moment([1975,8-1,31]),'date','date');
    t.end();
});

test("time units", function(t) {
    //time
    //tu('1800 as date',1800,'year','time');
    //tu('1820 as date',1820,'year','time');
    //tu("date('Sept 26th, 2014')",-1,'date','time');
    //tu("time('12:30')",-1,'time','time');
    //tu("time('13:30')",-1,'time','time');
    //tu("time('1:30 pm')",-1,'time','time');
    //tu("time('8:30 pm') - time('6:30 am')",-1,'time','duration');
    //tu("date('Sept 18th 2000') - date('Sept 14th 1900')",-1,'year','duration');
    //tu("(date('Sept 18th 2000') - date('Sept 14th 1900')) in day",-1,'day','duration');
    t.end();
});


test("superman",function(t){
    compareCompoundUnit(t,"6 m / (3 m/s)",2,['second',1]);
    compareCompoundUnit(t,"40075000 m / (346 m/s * 2)",40075000/(346*2),['second',1]);
    //compareCompoundUnit(t,"40075 km / (346 m/s * 2)",40075000/(346*2),['second',1]);
    //compareCompoundUnit(t,"24902 mi / (346 m/s * 2)",40075000/(346*2),['second',1]);
    //compareCompoundUnit(t,"24902 mi / (346 m/s * 2) as hours",40075000/(346*2),['second',1]);
    t.end();
})

/*
test("variable equations", function(t) {
    //pi
    compareNumber(t,'pi',Math.PI);
    compareUnit(t,'pi * 1m',Math.PI,'meter');
    compareUnit(t,"pi * (42m)^2",Math.PI*42*42,'meter',2);
    //people per square mile in CA.
    compareNumber(t,'ca_pop',100,'custom');
    compareUnit(t,'ca_area',1000,'mile',2);
    compareCompoundUnit(t,'ca_area/ca_pop',10,['custom',1,'mile',2]);
    //time to fly around the earth
    compareUnit(t,'earth_circ',7*1000,'mile');
    compareCompoundUnit(t,'airspeed',700,['miles',1,'hour',-1]);
    compareUnit(t,'earth_circ/airspeed',10,'hour',1);
    // how earths could fit inside of jupiter
    compareUnit(t,'jupiter_rad',10*1000,'mile',1);
    compareUnit(t,'earth_rad',1*1000,'mile',1);
    compareUnit(t,'(4/3*pi*jupiter_rad^2)/(4/3*pi*earth_rad^2)',10,'none');
    t.end();



 //parsing
 compareCompoundUnit("5m/s",  5, ['meter',1,'second',-1]);
 compareCompoundUnit("5m/s^2",5, ['meter',1,'second',-2]);
 compareCompoundUnit("60 mi/h",60,['mile',1,'hour',-1]);

 //arithmetic
 compareCompoundUnit("10m/s - 3m/s",7,['meter',1,'second',-1]);
 compareCompoundUnit('1m/s  - 3C/s',null); // this is an error. can't add those units
 compareCompoundUnit("10m/s * 5s",50,['meter',1]);
 compareCompoundUnit("5m/s * 2C",10,['meter',1,'second',-1,'celsius',1]);

 //rate of 1 degree per year
 compareCompoundUnit("0.5C/yr * 200yr",100,['celsius',1]);
 comapreCompoundUnit("40C / 20 yr",2,['celsius',1,'year',-1]);


 //time to fly around the earth
 compareCompoundUnit(t,'earth_circ',7*1000,['mile',1]);
 compareCompoundUnit(t,'airspeed',700,['miles',1,'hour',-1]);
 compareCompoundUnit(t,'earth_circ/airspeed',10,['hour',1]);


 });
*/
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


function parse(str) {
    return Parser.matchAll(str,'start');
}
function compareNumber(t,str,val) {
    var epsilon = 0.000000001;
    parse(str).value().then(function(v){
        if(Math.abs(val-v._value) > epsilon) {
            t.fail("not equal " + val + " " +v._value);
        }
    }).done();
}

function compareFormat(t,str,val,unit) {
    var epsilon = 0.01;
    parse(str).value().then(function(v) {
        console.log("value is ", v.toString());
        if(Math.abs(val-v._value)/val > epsilon) {
            t.fail("not equal " + val + " " +v._value);
        }
        if(v.hasUnit() == false && unit=='decimal') return;
        if(v.hasUnit() == false) t.fail('unit is missing');
        if(!Units.equal(v.getUnit(),Units.Unit(unit))) {
            t.fail("units not equal " +  v.getUnit() + ' ' +unit);
        }
    }).done();
}
function compareUnit(t,str,val,unit,dim, DEBUG) {
    if(!dim) dim = 1;
    if(unit == 'cubicfoot') {
        dim = undefined;
    }
    if(DEBUG) {
        console.log("parsing",str);
    }
    var epsilon = 0.01;
    parse(str).value().then(function(v){
        if(DEBUG) {
            console.log(v);
            console.log('has unit', v.hasUnit());
            if(v.hasUnit()){
                console.log(v.getUnit().toString());
            }
        }
        if(Math.abs(val-v._value)/val > epsilon) {
            t.fail("not equal " + val + " " +v._value);
        }
        if(v.hasUnit() == false && unit=='none') return;
        if(v.hasUnit() == false) t.fail('unit is missing');
        if(!Units.equal(v.getUnit(),Units.Unit(unit,dim))) {
            t.fail("units not equal " +  v.getUnit() + ' ' +Units.Unit(unit,dim));
        }
    }).done();
}
function compareCompoundUnit(t,str,val,units) {
    var epsilon = 0.01;
    parse(str).value().then(function(v){
        //console.log("became " + v.toString());
        //console.log("number = ", v.getNumber());
        if(Math.abs(val-v.getNumber())/val > epsilon) {
            t.fail("not equal " + val + " " +v.getNumber());
        }
        var u = v.getUnit();
        t.equal(u.type,'compound');
    }).done();

}
