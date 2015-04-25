var React = require('react');
var Literals = require('../src/Literals');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
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
        this.ctx = Context;
        try {
            var makeList = {
                kind: 'function',
                type: 'simple',
                name: 'makeList',
                fun: function () {
                    var items = [Literals.makeNumber(1), Literals.makeNumber(2)];
                    var list = Literals.makeList(items);
                    setInterval(function () {
                        items.push(Literals.makeNumber(3));
                        list.update(items);
                    }, 500);
                    return list;
                }
            };
            var makeListSymbol = Symbols.make('makeList');
            this.ctx.register(makeListSymbol, makeList);
            console.log("set up makeList function");
            this.setState({
                raw: this.props.expr.content
            });
        } catch (e) {
            console.log(e);
        }
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
        expr.value(this.ctx).then(function(v) {
            console.log("evaluated to a = ",v.type);
            self.props.onChange(self.props.expr,self.state.raw);
            self.setState({
                result: v
            });
            if(v.type == 'list') {
                v.onChange(function(vv) {
                    console.log("list updated",vv);
                    self.setState({result:vv});
                });
            }
        }).done();
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
    componentDidMount: function() { },
    renderRow: function(row, infos, count) {
        var cols = infos.map(function(info,i){
            return <td key={'cell_'+count+'_'+i}>{info.print(row)}</td>
        });
        return <tr key={'rowx_'+count}><td className='row-header' key={'cell_head'}>{count+1}</td>{cols}</tr>;
    },
    render: function() {
        //list
        var infos = this.props.data.getColumnInfos();
        var itr = this.props.data.getIterator();
        var rows = [];
        var count = 0;
        while(itr.hasNext()) {
            rows.push(this.renderRow(itr.next(),infos,count));
            count++;
        }

        var headers = infos.map(function(info) {
            return <th>{info.title()}</th>;
        });

        return <div className='grow scroll result'><table className='grow'>
            <thead><th className='row-header'>#</th>{headers}</thead>
            <tbody>{rows}</tbody>
        </table></div>
    }
});
