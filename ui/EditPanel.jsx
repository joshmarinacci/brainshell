var React = require('react');
var Literals = require('../src/Literals');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
/*
var funcall1 = Expressions.makeFunctionCall(Arithmetic.Add,
    [Literals.makeNumber(5), Literals.makeNumber(5)],
    {});
var funcall2 = Expressions.makeFunctionCall(Arithmetic.Add,
    [Literals.makeNumber(10),Literals.makeNumber(11)],
    {});
*/
function ParseExpression(str) {
    console.log("parsing expression",str);
    var out = Parser.matchAll(str,'start');
    console.log("parsed = " + out.toCode());
    return out;
}


var EditPanel = React.createClass({
    getInitialState: function() {
        return {
            evaluated: false,
            result: null
        }
    },
    doEval: function() {
        var self = this;
        var expr = ParseExpression(this.props.content);
        expr.value().then(function(v) {
            self.setState({
                result: v
            })
        })
    },
    render: function() {
        var c = this.props.content;
        return (<div className="vbox panel">
            <header>
                <button>move</button>
                <button onClick={this.doEval}>eval</button>
                <button>delete</button>
                <button>append</button>
            </header>
            <textarea className="grow" value={c}></textarea>
            <div className="results">
                = {this.state.result}
            </div>
        </div>)
    }
});


module.exports = EditPanel;