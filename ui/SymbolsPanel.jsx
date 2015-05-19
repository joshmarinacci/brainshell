var React = require('react');
var SymbolsPanel = React.createClass({
    render: function() {
        var items = this.props.items.map(function(item) {
            var desc = "";
            console.log("item symbol = ",item.symbol);
            if(item.symbol._value.doc) {
                var doc = item.symbol._value.doc;
                if(doc.short) desc = <div>{doc.short}</div>
                if(doc.examples)
                    desc = <div><p>{doc.short}</p><ul>{doc.examples.map(function(ex){
                        return <li>{ex}</li>
                        })}</ul></div>
            }
            return <li><b>{item.name}</b>{desc}</li>;
        });
        return <ul className="list symbols">{items}</ul>;
    }
});

module.exports = SymbolsPanel;
