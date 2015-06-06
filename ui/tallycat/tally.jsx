var React = require('react');
var Context = require('../../src/Context');
var ctx = Context.global();
var Symbols = require('../../src/Symbols');
var Q = require('q');
var ometajs = require('ometa-js');
var moment = require('moment');
var Parser = require('../../parser_compiled.js').Parser;
var utils = require('../../src/utils');

var SESSION_ID = "session_"+Math.floor(Math.random()*100000000);

function postEvent(evt) {
    evt.timestamp = new Date();
    evt.session = SESSION_ID;
    utils.POSTJSON('/event',evt)
        .then(function(ret){
            console.log("event post returned",ret);
        })
        .done();
}


var MainView = React.createClass({
    componentDidMount: function() {
        postEvent({state:'render-end'});
    },
    getInitialState: function() {
        return {
            raw:null,
            result:null,
            error:null,
            rightPanelVisible:false,
            wrongPanelVisible:false
        }
    },
    evaluateExpression: function() {
        var txt = this.refs.input.getDOMNode().value;
        postEvent({state:'evaluating', data:""+txt});
        this.setRaw(txt);
        console.log("evaluating",txt);
        var self = this;
        try {
            var expr = Parser.matchAll(txt,'start');
            expr.value(Context.global()).then(function(v) {
                self.setResult(v);
            },function(err){
                console.log("an error happened",err);
                self.setError(err);
            }).done();
        } catch (err) {
            console.log("error",err);
            this.setError(err);
        }
    },
    setRaw: function(raw) {
        this.setState({raw:raw});
    },
    setResult: function(res) {
        postEvent({state:'result', data:""+res});
        if(res == null) {
            return this.setState({error:"no result"});
        }
        this.setState({result:res});
    },
    setError: function(err) {
        postEvent({state:'error', data:err, message:""+err});
        this.setState({error: err});
    },
    renderCode: function() {
        if(this.state.raw == null) return "";
        return this.state.raw + " is ";
    },
    renderResult: function() {
        if(this.state.result == null) return "";
        return this.state.result.toCode();
    },
    renderError: function() {
        if(this.state.error == null) return "";
        return this.state.error.toString();
    },
    rightAnswer: function() {
        this.setState({rightPanelVisible:true});
        this.setState({wrongPanelVisible:false});
    },
    wrongAnswer: function() {
        this.setState({wrongPanelVisible:true});
        this.setState({rightPanelVisible:false});
    },
    sendRight: function() {
        postEvent({state:'right-answer',
            email:""+this.refs.rightemail.getDOMNode().value,
        });
        this.setState({rightPanelVisible:false});
    },
    sendWrong: function() {
        postEvent({state:'wrong-answer',
            email:""+this.refs.wrongemail.getDOMNode().value,
            correction:""+this.refs.wrongcorrection.getDOMNode().value
        });
        this.setState({wrongPanelVisible:false});
    },
    keyDown: function(e) {
        if(e.key == 'Enter') {
            this.evaluateExpression();
            e.preventDefault();
            e.stopPropagation();
        }
    },
    render: function() {
        console.log("rendering");
        var wrongClss = "hidden";
        var rightClss = "hidden";
        if(this.state.rightPanelVisible) {
            rightClss = "vbox";
        }
        if(this.state.wrongPanelVisible) {
            wrongClss = "vbox";
        }
        var queryClss = "hidden";
        if(this.state.error != null || this.state.result != null) {
            queryClss = "";
        }
        return <div id='center'>
            <div id='editor'>
                <input ref='input' type="text" defaultValue="8ft * 9ft * 10ft as gal"
                    onKeyDown={this.keyDown}/>
                <button onClick={this.evaluateExpression}>Go</button>
            </div>
            <div id="result">
                <div id="pretty">
                    {this.renderCode()}
                </div>
                <div id="answer">
                    {this.renderResult()}
                </div>
                <div id="error">
                    {this.renderError()}
                </div>
                <div id="query" className={queryClss}>
                    Is this answer
                    <button onClick={this.rightAnswer}>right</button>
                    or
                    <button onClick={this.wrongAnswer}>wrong</button>
                    ?
                </div>
                <div id="slideout-wrong" className={wrongClss}>
                    What is the answer you were expecting?<br/>
                    <textarea ref='wrongcorrection' id="correction" rows='4'></textarea><br/>
                    Optional: give us your email to be notified when it's fixed.<br/>
                    <input ref='wrongemail' type="email" placeholder='you@email.com'/><br/>
                    <button onClick={this.sendWrong}>send</button>
                </div>
                <div id="slideout-right" className={rightClss}>
                    Awesome!<br/>
                    Can we have your email to let you know about updates?<br/>
                    <input ref='rightemail' type="email" placeholder='you@email.com'/><br/>
                    <button onClick={this.sendRight}>send</button><br/>
                </div>
            </div>
        </div>
    }
});

postEvent({state:'render-start'});
React.render(<MainView/>,document.getElementById("main"));
