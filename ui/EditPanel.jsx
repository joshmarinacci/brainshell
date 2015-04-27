var React = require('react');
var Literals = require('../src/Literals');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var DocsStore = require('./DocsStore');

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
        /*
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

        }*/
        this.setState({
            raw: this.props.expr.content
        });
    },
    changed: function() {
        this.setState({
            raw: this.refs.text.getDOMNode().value
        });
    },
    doEval: function() {
        var self = this;
        var expr = ParseExpression(this.state.raw);
        if(expr.onChange) {
            expr.onChange(function() {
                expr.value(Context.global()).then(function(v) {
                    self.setResult(v);
                }).done();
            });
        }
        expr.value(Context.global()).then(function(v) {
            self.setResult(v);
        }).done();
    },
    setResult: function(v) {
        this.props.onChange(this.props.expr,this.state.raw);
        this.setState({
            result: v
        });
    },
    doAppend: function() {
        DocsStore.insertExpressionAfter(this.props.doc, this.props.expr, this.props.index);
    },
    keyDown: function(e) {
        if(e.ctrlKey && e.key == 'Enter') {
            this.doEval();
            e.preventDefault();
            e.stopPropagation();
        }
    },
    renderResult: function(res) {
        if(!res) return "";
        if(res.type == 'list') {
            return <TableOutput data={res}/>
        }
        if(res.type == 'list-wrapper') {
            return <TableOutput data={res}/>
        }
        return  <div>{res.toCode()}<br/>{res.type}<br/> {res.kind}</div>
    },
    render: function() {
        var res = this.renderResult(this.state.result);

        return (<div className="vbox edit-panel">
            <header>
                <button>move</button>
                <button onClick={this.doEval}>eval</button>
                <button>delete</button>
                <button onClick={this.doAppend}>append</button>
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
