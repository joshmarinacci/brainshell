var React = require('react');
var EditableLabel = React.createClass({
    getInitialState: function() {
        return {
            editing: false,
            editText: 'text'
        }
    },
    editedText: function() {
        var txt = this.refs.textfield.getDOMNode().value;
        this.setState({
            editText: txt
        });
    },
    getEditField: function() {
        if(this.state.editing === true) {
            return <input ref='textfield' type='text' value={this.state.editText} onChange={this.editedText}/>;
        } else {
            return <span ref='span'>{this.props.value}</span>;
        }
    },
    toggleEditing: function() {
        if(this.state.editing === true) {
            this.setState({
                editing:false
            });
            if(this.props.onChange) {
                this.props.onChange(this.state.editText);
            }
        } else {
            this.setState({
                editing: true,
                editText: this.props.value
            });
        }
    },
    render: function() {
        var cls = 'fa fa-edit';
        if(this.state.editing) {
            cls = 'fa fa-check';
        }
        return (
            <div className='group grow'>
                <button className={cls} onClick={this.toggleEditing}></button>
                {this.getEditField()}
            </div>
        );
    }
});


module.exports = EditableLabel;