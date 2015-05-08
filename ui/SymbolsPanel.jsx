var React = require('react');
var SymbolsPanel = React.createClass({
    render: function() {
        var items = this.props.items.map(function(item) {
            return <li>{item.name}</li>;
        });
        return <ul className="list">{items}</ul>;
    }
});

module.exports = SymbolsPanel;
