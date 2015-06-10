# brainshell
A magical wordprocessor for your brain




------------

notes


there are functions and symbols. 
variables are symbols that might change. constants are symbols that won't change.
literals are constants.
objects are compound structures
all objects are immutable 
functions take N arguments and return one value
functions should be pure (except in special cases)
functions will be re-evaluated when any of it's arguments changes
assignment is just syntax sugar for a special function
compound literals like lists and tables are just syntax sugar for functions which return new objects

expressions create dependency graphs of symbols.
an anonymous expression is a symbol that just doesn't have a name
a function call is an expression
updates happen when something changes and triggers an update event across the dependency graph
to get a value from an expression/symbol call value() which returns a promise. evaluate the promise to get the
final value.

functions may take both positional and named arguments.
the pipeline is a function which takes the result of it's first argument and applies the result as the first arg of the second argument.
ex:
 foo() => bar(debug:true)
is equivalent to
 bar(foo(),debug:true)

 

implementations may use eager or lazy evaluation as desired.
implementations may calculate the results immediately or fetch data across the network


initial demos
* arithmetic and conversion with length units
* fetch two stock prices and draw them on the same chart with automatic scaling of axes
* get the list of all known elements, show only the weights, calculate ratio of number to weight for each element, show as a complete chart
* define a list literal of 10 numbers. get the sum. edit to add a new value. the sum should update.
* show hits on my blog for last 10 days, organized into 1hr buckets for time of day. live update the table as new data comes in
* load up list of all known arduino boards, filter to only arduino inc. boards, and sort them alphabetically by cpu speed, then by and ram size

--------
UI has

notebook interface of text fields. shows results below it.  add new entry fields automatically. drag with drag handle to rearrange. change type
to plain text if desired (add wysiwyg later). output is put into the appropriate type of panel.  
html table with scrolling, sorting, filtering for lists/tables.
styled text for numeric and string output
chart, svg, webgl, or canvas outputs as needed

when an existing doc is loaded, evaluate from top to bottom with promises


list of existing documents on the left side.
auto-save constantly. go back in time if desired with a toolbar command. add new doc w/ name, delete selected doc, 
list of available resources and functions on the right side
toolbar at the top for actions
toolbar at the bottom for status
constantly connected to the server
arithmetic happens on the client
data fetching and analysis and filtering happens on the server, except for literals.




user browserify to compile everything

today: get basic interface with unitless arithmetic, 
create doc w/title, 
auto-save doc every 10 seconds, 
load doc from database, 
compiled with browserify 




------------


A list is an object with a bunch of values in it that can be accessed. The values can be accessed by numeric or symbolic
indexes.  If numeric then the list is like an array. If symbolic then the list is like an object map.
A table is a list containing other lists, thus a two dimensional list, with the primary axis having numeric indexes.
  
A list may be rendered as a simple list of boxes, either numeric indexes/value pairs or name/value pairs
A table may be rendered as an HTML table, with the outer indexes on the left and the inner indexes on the top. 


A list or table may have operations applied to it.

Sort('x') to sort by the X column
Sort('x',direction:ascending) to sort by the X column with the direction ascending
//Group('x') will return a new table with one row for each column in the original, and the count

column names
column types
column formats
get column as list
get row as list
sort by a column
filter by some criteria, like start and ending dates, or range of value, or particular
column equals some value.


----
 
compound units:
 
gravity is 9.8 meters per seconds squared. the current units system can't represent this.
to solve this we need compound units. a compound unit is composed of multiple units combined with
exponents/dimension. potentially this could subsume the current way of working with units, but for
now this will be an addition. 

there are three parts to the implementation.

* representing compound units in code
* parsing the written representation
* doing math with them and regular units

to represent the compound unit we have a new unit with the type 'compound'. it contains an array of sub-units.
it reimplements the various unit methods to work correctly with the sub-units. this may require changing
the api since currently units have some exposed properties instead of using proper methods.

unit.toString()
unit.dimension()
unit.name()
unit.type()
unit.toJSON() ??
unit.base()
unit.scale()

unit.abbr() shouldn't be here. that should be a separate mapping. scale and base might also be 
internal. move to underscore prop notation

gravity is represented as 

```
{
    type: 'compound',
    name: 'compound',
    //base
    //abbr
    //scale
    units: [
        {
            type:'length',
            name:'meter',
            dim:1,
        },
        {
            type:'duration',
            name:'second',
            dim:-2,
        }
    ]
}
```

parsing requires modifying the parser.  we should support only canonical respresentaitons like
m/s^2 and mi/h, at least first. some special cases may be for common uses such as mph. might become
tricky, though.

extend the unit parser rule to have
unit = unitname (^ num)? ('/' unitname (^num)?)?  | unitname (^num)?

math with these compound units requires scaling them all to a common base unit (as applicable by type), 
appending to the list of subunits, then reducing. this happens with multplication and division.
for addition and subtraction they must simply have the same units to be combined.

ex:  5m/s * 10h = 100m.
convert to compound units
5(m^1,s^-2) * 10(h^1)
check that the units are scaled correctly. s and h are compatible but in the wrong base.
convert 10 to seconds.
5(m^1,s^-2) * 10*60*60(s^1)
now multiply the scalars and combine the units
5*10*60*60 (m^1,s^-2,s^1)
reduce the units. add exponents: s^-2 and s^1 => s^-1 
180_000 (m^1, s^-1)
render the compound unit
180,000 m/s

when reducing, if the exponent of a unit is 0, then remove it


  



