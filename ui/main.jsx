var React = require('react');

var EditPanel = React.createClass({
    render: function() {
        var c = this.props.content;
        return (<div className="vbox panel">
                <header>
                    <button>move</button>
                    <button>eval</button>
                    <button>delete</button>
                    <button>append</button>
                </header>
                <textarea className="grow" value={c}></textarea>
                <div className="results">
                    {c} = 9
                </div>
            </div>)
    }
});

var four = Literal.makeNumber(4);
var five = Literal.makeNumber(5);
var fun = Arithmetic.Add;
var funcall = Expressions.makeFunctionCall(fun,[four,five],{});

var DocsStore = {
    getDocs: function() {
        return [
            {
                title: 'foo',
                id: 'docid_1',
                expressions: [
                    {
                        type:'code',
                        content: '4-5'
                    }
                ]
            },
            {
                title:'bar',
                id:'docid_2',
                expressions:[
                    {
                        type:'code',
                        content:'4*5'
                    }
                ]
            }
        ]
    }
};

var MainView = React.createClass({
    render: function() {
        var docs = DocsStore.getDocs().map(function(doc) {
            return <li key={doc.id}>{doc.title}</li>;
        });
        var doc = DocsStore.getDocs()[0];
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
React.render(<MainView/>,document.getElementById("main"))