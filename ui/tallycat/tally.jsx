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

var demoLinks = [
    {
        desc:"What's 99 to the 99th power?",
        expr:"99^99"
    },
    {
        desc:"How many shots in a bottle of tequila?",
        expr:"750ml / 2floz"
    },
    {
        desc:"How much is a teaspoon in gallons?",
        expr:"1 teaspoon as gallons"
    },
    {
        desc:"How far is 20,000 leagues, anyway?",
        expr:"20_000 leagues as miles"
    },
    {
        desc:"How much watter does my office hold?",
        expr:"8ft * 9ft * 10 ft as gallons"
    }
];

var DemoLinks = React.createClass({
    setExpression: function(i){
        console.log("setting the expression ", this.props.links[i]);
        this.props.setExpression(this.props.links[i].expr);
    },
    render: function() {
        var links = this.props.links.map(function(link,i){
            return <li key={link.expr}>
                <i>{link.desc}</i><br/>
                <a onClick={this.setExpression.bind(this,i)}>{link.expr}</a>
            </li>;
        },this);
        return <ul id='ideas1'>{links}</ul>;
    }
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var MainView = React.createClass({
    componentDidMount: function() {
        postEvent({state:'render-end'});
        if(document.location.search != "") {
            var ib = getParameterByName("ib");
            this.setState({expression:ib});
        }
    },
    getInitialState: function() {
        return {
            expression:'4*5ft',
            raw:null,
            result:null,
            error:null,
            rightPanelVisible:false,
            wrongPanelVisible:false,
            sharingUrl:'foo',
            sharePanelOpen:false
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
        if(this.state.result.type == 'numeric') {
            return ""+this.state.result.getNumber().toFixed(4);
        }
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
        postEvent({
            state:'wrong-answer',
            email:""+this.refs.wrongemail.getDOMNode().value,
            correction:""+this.refs.wrongcorrection.getDOMNode().value
        });
        this.setState({wrongPanelVisible:false});
    },
    changeExpression: function(e) {
        var expr = this.refs.input.getDOMNode().value;
        this.setState({expression:expr});
    },
    setExpression: function(expr) {
        this.setState({expression:expr});
    },
    keyDown: function(e) {
        if(e.key == 'Enter') {
            this.evaluateExpression();
            e.preventDefault();
            e.stopPropagation();
        }
    },
    share: function() {
        var parser = document.createElement('a');
        parser.href = "./"+encodeURI("?ib="+this.state.expression);
        var url = parser.protocol+'//'+parser.host+parser.pathname+parser.search;
        console.log("sharing " + url);
        this.setState({
            sharePanelOpen:true,
            sharingUrl:url
        });
    },
    selectShare: function() {
        this.refs.shareField.getDOMNode().select();
    },
    closeSharePanel: function() {
        this.setState({sharePanelOpen:false});
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
        var shareClss = "hbox hidden";
        if(this.state.sharePanelOpen === true) {
            shareClss = "hbox ";
        }
        return <div className="hbox">
            <DemoLinks links={demoLinks} setExpression={this.setExpression}/>
            <div id="main">
                <div id='center'>
                    <div id='editor'>
                        <input
                                ref='input'
                                type="text"
                                value={this.state.expression}
                                defaultValue="8ft * 9ft * 10ft as gal"
                                onChange={this.changeExpression}
                                onKeyDown={this.keyDown}/>
                        <button onClick={this.evaluateExpression}>Go</button>
                        <button onClick={this.share}>Share</button>
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
                        <div id='sharePanel' className={shareClss}>
                            <input ref='shareField' type='text' value={this.state.sharingUrl} onFocus={this.selectShare} className='grow'/>
                            <button onClick={this.closeSharePanel}>close</button>
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
                            <button onClick={this.sendRight}>send</button>
                            <br/>
                        </div>
                    </div>
                </div>
            </div>
            <dl id="ideas2">
            </dl>
        </div>;
    }
});

postEvent({state:'render-start'});
React.render(<MainView/>,document.getElementById("content"));
/*
 <dl id="ideas1">
 </dl>
 <dl id="ideas2">
 </dl>

 */
