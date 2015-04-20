var React = require('react');
var Q = require('q');
var Literals = require('../src/Literals');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');



var funcall1 = Expressions.makeFunctionCall(Arithmetic.Add,
    [Literals.makeNumber(5), Literals.makeNumber(5)],
    {});
var funcall2 = Expressions.makeFunctionCall(Arithmetic.Add,
    [Literals.makeNumber(10),Literals.makeNumber(11)],
    {});
function ParseExpression(str) {
    console.log("parsing",str);
    return funcall1;
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



var GETJSON = function(url) {
    return Q.Promise(function(resolve, reject, notify) {
        var xml = new XMLHttpRequest();
        xml.onload = function() {
            if(xml.status == 200) {
                var payload = JSON.parse(xml.responseText);
                resolve(payload);
            } else {
                reject(xml.status);
            }
        };
        xml.open('GET',url);
        xml.send();
    });
};

var DocsStore = {
    cbs:[],
    _docs:[],
    on:function(type,cb) {
        this.cbs.push(cb);
    },
    notify: function() {
        this.cbs.forEach(function(cb) {
            cb();
        })
    },
    init: function() {
        var self = this;
        GETJSON('http://localhost:30045/josh/docs').then(function(data) {
            self._docs = data;
            self.notify();
        });
    },
    getDocs: function() {
        return this._docs;
    }
};

var MainView = React.createClass({
    getInitialState: function() {
        return {
            docs:DocsStore.getDocs(),
            selectedDoc:{ expressions:[] }
        }
    },
    componentDidMount: function() {
        var self = this;
        DocsStore.on('change',function() {
            var docs = DocsStore.getDocs();
            var sel = null;
            if(docs.length > 0) {
                sel = docs[0];
            }

            self.setState({
                docs:docs,
                selectedDoc: sel
            });
        })
    },
    render: function() {
        var docs = this.state.docs.map(function(doc) {
            return <li key={doc.id}>{doc.title}</li>;
        });
        var doc = this.state.selectedDoc;
        var panels = doc.expressions.map(function(expr,i) {
            return <EditPanel key={i} content={expr.content}/>
        });
        return(
            <div className="fill vbox">
            <header>BrainShell</header>
            <div className="hbox grow">
            <div className="vbox" id="docs-pane">
                <header>Documents</header>
                <ul className="list grow">
                    {docs}
                </ul>
            </div>
            <div className="vbox grow" id="editor-pane">
                {panels}
            </div>
            <div className="vbox" id="help-pane">
                <header>Resources</header>
                <div className="form">
                    <div className="row">
                        <input type="search"/>
                        <button className="fa fa-search"></button>
                    </div>
                </div>
                <ul className="list">
                    <li>Elements</li>
                    <li>Stock</li>
                    <li>ExoPlanets</li>
                </ul>
            </div>
            </div>
            <footer>
                some stuff here
            </footer>
            </div>
           );
    }
});

React.render(<MainView/>,document.getElementById("main"));


DocsStore.init();
