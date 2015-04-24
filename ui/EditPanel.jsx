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
            result: null,
            raw: 'nothing'
        }
    },
    componentDidMount: function() {
        this.setState({
            raw: this.props.expr.content
        });
    },
    changed: function() {
        //console.log('chnaged to ', this.refs.text.getDOMNode().value);
        this.setState({
            raw: this.refs.text.getDOMNode().value
        });
    },
    doEval: function() {
        var self = this;
        var expr = ParseExpression(this.state.raw);
        expr.value().then(function(v) {
            console.log("v = ",v.type);
            self.props.onChange(self.props.expr,self.state.raw);
            self.setState({
                result: v
            })
        })
    },
    keyDown: function(e) {
        if(e.ctrlKey && e.key == 'Enter') {
            this.doEval();
            e.preventDefault();
            e.stopPropagation();
        }
    },
    render: function() {
        var res = "";
        if(this.state.result) {
            if(this.state.result.type == 'list') {
                res = <TableOutput data={this.state.result}/>
            } else {
                res = <div>{this.state.result.toCode()}
                    <br/>{this.state.result.type}<br/> {this.state.result.kind}</div>
            }
        }
        return (<div className="vbox panel">
            <header>
                <button>move</button>
                <button onClick={this.doEval}>eval</button>
                <button>delete</button>
                <button>append</button>
            </header>
            <textarea
                ref='text'
                className="grow"
                value={this.state.raw}
                onChange={this.changed}
                onKeyDown={this.keyDown}
                ></textarea>
            <div className="results">
                {res}
            </div>
        </div>)
    }
});


module.exports = EditPanel;



var TableOutput = React.createClass({
    render: function() {
        //list
        var rows = this.props.data._value.map(function(row,i) {
            if(row.type == 'list') {
                var cols = row._value.map(function(cell,i){
                    if(cell.type == 'pair') {
                        return <td>{cell._value.toCode()}</td>
                    }
                    return <td>{cell.toCode()}</td>
                });
                return <tr><td>{i+1}</td>{cols}</tr>
            }
            return <tr><td>{i+1}</td><td>{row.toCode()}</td></tr>
        });

        var first = this.props.data._value[0];
        if(first.type == 'list') {
            var headers = first._value.map(function(item,i){
                if(item.type == 'pair') {
                    return <th>{item._key}</th>
                }
                return <th>{i+1}</th>
            });
        } else {
            var headers = <th>value</th>
        }

        return <table className='grow'>
            <thead><th>#</th>{headers}</thead>
            <tbody>{rows}</tbody>
        </table>
    }
});
