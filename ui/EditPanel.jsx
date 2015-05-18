var React = require('react');
var Literals = require('../src/Literals');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var Symbols = require('../src/Symbols');
var Context = require('../src/Context');
var ometajs = require('ometa-js');
var Parser = require('../parser_compiled.js').Parser;
var DocsStore = require('./DocsStore');
var TableOutput = require('./TableOutput.jsx');
var BarChart = require('./BarChart.jsx');

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
            result: ".",
            raw: 'nothing',
            rows:1,
            error:null,
        }
    },
    setRaw: function(content) {
        var lines = content.split('\n').length;
        this.setState({
            raw: content,
            rows:lines
        });
    },
    componentDidMount: function() {
        this.setRaw(this.props.expr.content);
    },
    componentWillUnmount: function() {
        if(this.expr && this.cb) {
            this.expr.removeListener(this.cb);
        }
    },
    changed: function() {
        this.setRaw(this.refs.text.getDOMNode().value);
    },
    doEval: function() {
        if(this.props.expr.type !== 'code') return;
        var self = this;
        try {
            var expr = ParseExpression(this.state.raw);
        } catch (err) {
            this.setError(err);
            return;
        }
        //remove the old one
        if (this.expr && this.cb) {
            this.expr.removeListener(this.cb);
        }
        this.expr = expr;
        this.cb = null;
        if (this.expr.onChange) {
            this.cb = this.expr.onChange(function () {
                expr.value(Context.global()).then(function (v) {
                    self.setResult(v);
                }).done();
            });
        }
        expr.value(Context.global()).then(function(v) {
            self.props.onChange(self.props.expr,self.state.raw);
            self.setResult(v);
            self.setError(null);
        },function(err) {
            self.setError(err);
        }).done();
    },
    setResult: function(v) {
        this.setState({
            result: v
        });
    },
    setError: function(e) {
        this.setState({
            error:e
        });
    },
    doAppendExpression: function() {
        DocsStore.insertExpressionAfter(this.props.doc, this.props.expr, this.props.index);
    },
    doAppendText: function() {
        DocsStore.insertPlaintextAfter(this.props.doc, this.props.expr, this.props.index);
    },
    keyDown: function(e) {
        if(e.ctrlKey && e.key == 'Enter') {
            this.doEval();
            e.preventDefault();
            e.stopPropagation();
        }
    },
    renderResult: function(res) {
        if(res == null) return "null";
        if(!res) return "";
        if(typeof res == 'string') return res;
        if(res.type == 'schart') {
            return <SChart data={res}/>
        }
        if(res.type == 'barchart') {
            return <BarChart data={res}/>
        }
        if(res.type == 'list') {
            return <TableOutput data={res}/>
        }
        if(res.type == 'list-wrapper') {
            return <TableOutput data={res}/>
        }
        return  <div>{res.toCode()}</div>
    },
    renderError: function(err) {
        if(!err || err == null) return (<div className='error hidden'></div>);
        return (<div className='error'>{err.toString()}</div>);
    },
    render: function() {
        var res = this.renderResult(this.state.result);
        var err = this.renderError(this.state.error);
        if(this.props.expr.type == 'code') {
            var toolbar =
                <div className='group'>
                    <button>move</button>
                    <button onClick={this.doEval}>eval</button>
                    <button>delete</button>
                    <button onClick={this.doAppendExpression}>+ expr</button>
                    <button onClick={this.doAppendText}>+ text</button>
                </div>;
            var resout = <div className="results">{res}</div>
        } else {
            var toolbar =
                <div className='group'>
                    <button>move</button>
                    <button>delete</button>
                    <button onClick={this.doAppendExpression}>+ expr</button>
                    <button onClick={this.doAppendText}>+ text</button>
                </div>
            var resout = "";
        }
        return (<div className="vbox edit-panel">
            <header>{toolbar}</header>
            <textarea
                ref='text'
                className=""
                rows={this.state.rows}
                value={this.state.raw}
                onChange={this.changed}
                onKeyDown={this.keyDown}
                ></textarea>
            {err}
            {resout}
        </div>)
    }
});


module.exports = EditPanel;



var SChart = React.createClass({
    componentDidMount: function() {
        this.drawCanvas(this.props.data.data);
    },
    componentWillReceiveProps: function(newProps) {
        this.drawCanvas(newProps.data.data);
    },
    drawCanvas: function(table) {
        var can = this.refs.canvas.getDOMNode();
        var g = can.getContext('2d');
        var w = 500;
        var h = 250;
        g.fillStyle = "lightGray";
        g.fillRect(0,0,w,h);
        g.fillStyle = "red";
        var len = table.length();
        g.save();
        g.translate(50,0);
        w-=100;
        var gap = 10;
        var bw = (w/len);
        var it = table.getIterator();
        var vals = [];
        while(it.hasNext()) {
            vals.push(it.next().getNumber());
        }
        var min =  1000000;
        var max = -1000000;
        vals.forEach(function(v) {
            min = Math.min(v,min);
            max = Math.max(v,max);
        });
        for(var i=0; i<vals.length; i++) {
            var val = vals[i];
            var vv = (val-min)/(max-min)*100;
            g.fillRect(i*bw,h-vv,bw-gap,vv);
        }
        g.restore();
    },
    render: function() {
        return <div>a chart is here:<br/><canvas ref='canvas' width='500' height='250'></canvas></div>
    }
});