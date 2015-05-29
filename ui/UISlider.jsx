var Literals = require('../src/Literals');
var React = require('react');
var UISlider = React.createClass({
    changed: function() {
        var val = this.refs.range.getDOMNode().value;
        //console.log("new value is",val);
        this.props.data.symbol.update(Literals.makeNumber(parseFloat(val)));

    },
    render: function() {
        var sym = this.props.data.symbol;
        var fval = sym._value._value;
        return <div className='grow'>
            <input ref='range' type='range' min='0' max='100' value={fval}
                   onChange={this.changed}
                />
            <label>{fval}</label>
        </div>
    }
});

module.exports = UISlider;