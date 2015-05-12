var React = require('react');
var Q = require('q');
var Literals = require('../src/Literals');
var Arithmetic = require('../src/Arithmetic');
var Expressions = require('../src/Expressions');
var utils = require('../src/utils');
var EditPanel = require('./EditPanel.jsx');
var DocsStore = require('./DocsStore');
var moment = require('moment');

var Context = require('../src/Context');
var Symbols = require('../src/Symbols');
var EditableLabel = require('./EditableLabel.jsx');
var SymbolsPanel = require('./SymbolsPanel.jsx');
var DefaultFunctions = require('./DefaultFunctions.js');
var CustomList = require('../node_modules/appy-style/react/CustomList.jsx');
var LocationStore = require('./LocationStore.jsx');

var ctx = Context.global();

DefaultFunctions.makeDefaultFunctions(ctx);
var DocItem = React.createClass({
    render: function() {
        return <li draggable='false' {...this.props}>{this.props.item.title}</li>
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
        if(LocationStore.hasDocId()) {
            var id = LocationStore.getDocId();
            console.log("we need to preload a doc",id);
            DocsStore.loadDoc(id).then(function(doc) {
                self.setState({
                    selectedDoc: doc
                });
            })
        } else {
            console.log("no prefab doc");
            DocsStore.createDoc().then(function(doc) {
                self.setState({
                    selectedDoc: doc
                });
                LocationStore.setDoc(doc);
            });
        }
        DocsStore.on('load',function(type) {
            if(type != 'load') return;
            var state = {
                docs: DocsStore.getDocs(),
                selectedDoc: null
            };
            if(state.docs.length > 0) state.selectedDoc = state.docs[0];
            self.setState(state);
        });
        DocsStore.on('update',function(type) {
            if(type != 'update') return;
            self.setState({
                docs: DocsStore.getDocs()
            });
        });
        DocsStore.on('delete',function(type) {
            if(type != 'delete') return;
            self.setState({
                docs: DocsStore.getDocs()
            });
        });
    },
    contentChanged: function(expr, content) {
        expr.content = content;
        DocsStore.saveDoc(this.state.selectedDoc);
    },
    forkDoc: function(){
        var self = this;
        DocsStore.forkDoc(this.state.selectedDoc).then(function(newDoc) {
            self.setState({
                selectedDoc: newDoc
            });
            LocationStore.setDoc(newDoc);
        });
    },
    docSelected: function(doc) {
        this.setState({
            selectedDoc:doc
        })
    },
    createNewDoc: function(doc) {
        var self = this;
        DocsStore.createDoc().then(function(doc) {
            self.setState({
                docs: DocsStore.getDocs(),
                selectedDoc: doc
            });
        }).done();
    },
    deleteDoc: function() {
        console.log("deleting the selected doc", this.state.selectedDoc);
        DocsStore.deleteDoc(this.state.selectedDoc);
        this.setState({
            selectedDoc:null
        });
    },
    titleChanged: function(txt) {
        console.log("the title changed to ",txt);
        this.state.selectedDoc.title = txt;
        this.setState({
            selectedDoc: this.state.selectedDoc
        });
        DocsStore.saveDoc(this.state.selectedDoc);
    },
    render: function() {
        var self = this;
        var doc = this.state.selectedDoc;
        if(doc == null) {
            var panels = [];
            var title = "";
        } else {
            var docid = this.state.selectedDoc._id;
            var title = doc.title;
            var panels = doc.expressions.map(function (expr, i) {
                return <EditPanel key={docid+i} expr={expr} onChange={self.contentChanged} doc={doc} index={i}/>
            });
        }
        return(
            <div className="fill vbox">
                <header>
                    <h3>BrainShell</h3>
                    <span className='grow'></span>
                    <button onClick={this.forkDoc}>fork</button>
                    <div className='group hidden'>
                        <button className='fa fa-toggle-left hidden'></button>
                        <button className='fa fa-toggle-right'></button>
                    </div>
                </header>
                <div className="hbox grow">
                    <div className="vbox grow" id="editor-pane">
                        <div className='grow scroll'>
                            {panels}
                        </div>
                    </div>
                </div>
            </div>
           );
    }
});

React.render(<MainView/>,document.getElementById("main"));

DocsStore.init();
/*
 <div className="vbox" id="docs-pane">
 <header>Documents</header>
 <CustomList items={this.state.docs} template={<DocItem/>} onSelect={this.docSelected}/>
 <footer>
 <button onClick={this.createNewDoc} className='fa fa-plus'></button>
 </footer>
 </div>

 <header>
 <EditableLabel value={title} onChange={this.titleChanged}/>
 <button onClick={this.deleteDoc} className="fa fa-close"></button>
 </header>


 <div className="vbox" id="help-pane">
 <header>Symbols</header>
 <div className='group hidden'>
 <input type="search" className='grow'/>
 <button className="fa fa-search"></button>
 </div>
 <SymbolsPanel items={Context.global().listSymbols()}/>
 </div>
 */
