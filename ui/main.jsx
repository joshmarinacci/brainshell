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

var ctx = Context.global();

function makeDefaultFunctions() {
    var fundef = {
        kind: 'function',
        type: 'simple',
        name: 'makeList',
        fun: function () {
            return Literals.makeList([Literals.makeNumber(1), Literals.makeNumber(2)]);
        }
    };
    Context.global().register(Symbols.make(fundef.name), fundef);

    var setColumnFormat = {
        kind:'function',
        type:'simple',
        name:'setColumnFormat',
        fun: function(data) {
            console.log('data',data);
            function StdColumnInfo(id,type) {
                this.id = function() {
                    return id;
                };
                this.title = function() {
                    return this.id();
                };
                this.type = function() {
                    return type;
                };

                this.getValue = function(row) {
                    return row[this.id()];
                };

                this.print = function(row) {
                    return ""+this.getValue(row);
                };
            }

            function setColumnFormat(list, key, options) {
                this.type = 'list-wrapper';
                this.getIterator = function() {
                    return list.getIterator();
                };
                this.getColumnInfos = function() {
                    var infos = list.getColumnInfos();
                    var index = 0;
                    for(var i=0; i<infos.length; i++) {
                        if(infos[i].id() == key) {
                            index = i;
                            break;
                        }
                    }
                    var newInfo = new StdColumnInfo(key,options.type);
                    if(options.type == 'number') {
                        newInfo.getValue = function (row) {
                            return parseFloat(row[this.id()]);
                        };
                    }
                    if(options.type == 'date') {
                        newInfo.getValue = function(row) {
                            return  moment(row.itemByKey(this.id()), options.parsePattern);
                        };
                        newInfo.print = function(row) {
                            return this.getValue(row).format(options.printPattern);
                        };
                    }
                    if(options.unit) {
                        newInfo.print = function (row) {
                            return this.getValue(row) + ' ' + options.unit;
                        };
                    }
                    infos[index] = newInfo;
                    return infos;
                }
            }
            return new setColumnFormat(data,'birthdate',{type:'date', parsePattern:'MM-DD-YY', printPattern: 'MMMM DD, YYYY'});
        }
    };

    Context.global().register(Symbols.make(setColumnFormat.name), setColumnFormat);
}
makeDefaultFunctions();

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
        var docs = this.state.docs.map(function(doc) {
            return <ListItem key={doc._id} item={doc} onSelect={self.docSelected} selectedItem={self.state.selectedDoc}>{doc.title}</ListItem>;
        });
        var self = this;
        var docid = this.state.selectedDoc._id;
        var doc = this.state.selectedDoc;
        var panels = this.state.selectedDoc.expressions.map(function(expr,i) {
            return <EditPanel key={docid+i} expr={expr} onChange={self.contentChanged} doc={doc} index={i}/>
        });
        return(
            <div className="fill vbox">
            <header>BrainShell</header>
            <div className="hbox grow">
            <div className="vbox" id="docs-pane">
                <header>Documents</header>
                <ul className="list grow">{docs}</ul>
                <footer>
                    <button onClick={this.createNewDoc}>add</button>
                </footer>
            </div>
            <div className="vbox grow" id="editor-pane">
                <header>
                    <EditableLabel className='grow'
                                   value={this.state.selectedDoc.title}
                                   onChange={this.titleChanged}/>
                    <button onClick={this.deleteDoc}>delete</button>
                </header>
                <div className='grow scroll'>
                    {panels}
                </div>
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
