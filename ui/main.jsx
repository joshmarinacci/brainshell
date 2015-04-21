var React = require('react');
var Q = require('q');
var Literals = require('../src/Literals');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var utils = require('../src/utils');
var EditPanel = require('./EditPanel.jsx');


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
        utils.GETJSON('http://localhost:30045/josh/docs').then(function(data) {
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
            var state = {
                docs: DocsStore.getDocs(),
                selectedDoc: null
            };
            if(state.docs.length > 0) state.selectedDoc = state.docs[0];
            self.setState(state);
        });
    },
    render: function() {
        var docs = this.state.docs.map(function(doc) {
            return <li key={doc.id}>{doc.title}</li>;
        });
        var panels = this.state.selectedDoc.expressions.map(function(expr,i) {
            return <EditPanel key={i} content={expr.content}/>
        });
        return(
            <div className="fill vbox">
            <header>BrainShell</header>
            <div className="hbox grow">
            <div className="vbox" id="docs-pane">
                <header>Documents</header>
                <ul className="list grow">{docs}</ul>
                <footer>
                    <button>add</button>
                </footer>
            </div>
            <div className="vbox grow" id="editor-pane">{panels}</div>
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
            </div>
           );
    }
});

React.render(<MainView/>,document.getElementById("main"));


DocsStore.init();
