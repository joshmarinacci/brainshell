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

var ListItem = React.createClass({
    clicked: function() {
        this.props.onSelect(this.props.item);
    },
    render: function() {
        var cn = "";
        if(this.props.item == this.props.selectedItem) {
            cn += 'selected';
        }
        return <li className={cn} onClick={this.clicked}>{this.props.children}</li>;
    }
});

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
    contentChanged: function(expr, content) {
        expr.content = content;
    },
    docSelected: function(doc) {
        this.setState({
            selectedDoc:doc
        })
    },
    render: function() {
        var self = this;
        var docs = this.state.docs.map(function(doc) {
            return <ListItem key={doc.id} item={doc} onSelect={self.docSelected} selectedItem={self.state.selectedDoc}>{doc.title}</ListItem>;
        });
        var self = this;
        var panels = this.state.selectedDoc.expressions.map(function(expr,i) {
            return <EditPanel key={i} expr={expr} onChange={self.contentChanged}/>
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
            <div className="vbox grow" id="editor-pane">
                <header>{this.state.selectedDoc.title}</header>
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
            </div>
           );
    }
});

React.render(<MainView/>,document.getElementById("main"));


DocsStore.init();
