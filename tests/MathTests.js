/**
 * Created by josh on 4/20/15.
 */


//4+5
Expressions.makeFunctionCall(Arithmetic.Addition, Literals.makeNumber(4), Literals.makeNumber(5)).value().then(function(val) {
    utils.eq(val,4+5);
})
//4*5
Expressions.makeFunctionCall(Arithmetic.Multiplication, Literals.makeNumber(4), Literals.makeNumber(5)).value().then(function(val) {
    utils.eq(val,4*5);
})
//4/5
Expressions.makeFunctionCall(Arithmetic.Division, Literals.makeNumber(4), Literals.makeNumber(5)).value().then(function(val) {
    utils.eq(val,4/5);
})
//4-5
Expressions.makeFunctionCall(Arithmetic.Subtraction, Literals.makeNumber(4), Literals.makeNumber(5)).value().then(function(val) {
    utils.eq(val,4-5);
})

