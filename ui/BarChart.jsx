var React = require('react');
var DataUtil = require('../src/DataUtil');

var BarChart = React.createClass({
    componentDidMount: function() {
        this.drawCanvas(this.props.data.data, this.props.data.xaxis, this.props.data.yaxis);
    },
    componentWillReceiveProps: function(newProps) {
        this.drawCanvas(newProps.data.data, newProps.data.xaxis, newProps.data.yaxis);
    },
    drawCanvas: function(data, xaxisDef, yaxisDef) {
        var can = this.refs.canvas.getDOMNode();
        var g = can.getContext('2d');
        var w = 500;
        var h = 250;
        g.fillStyle = 'white';
        g.fillRect(0,0,w,h);

        if(!xaxisDef){
            var xinfo = {
                count:0,
                print: function(row) {
                    this.count++;
                    return ""+this.count;
                }
            }
        } else {
            var xaxis = xaxisDef.getValue().getString();
            var xinfo = DataUtil.findColumnInfoFor(data,xaxis);
        }
        if(!yaxisDef) {
            var yinfo = {
                getValue: function(row) {
                    if(row.kind == 'literal') return row;
                    return {
                        getNumber: function() {
                            return -1;
                        }
                    }
                }
            }
        } else {
            var yaxis = yaxisDef.getValue().getString();
            var yinfo = DataUtil.findColumnInfoFor(data,yaxis);
        }

        var min = 0;
        var max = 10;
        var count = 0;
        var it = data.getIterator();
        while(it.hasNext()) {
            var row = it.next();
            var val = yinfo.getValue(row).getNumber();
            min = Math.min(min,val);
            max = Math.max(max,val);
            count++;
        }

        var x = 0;
        var bw = w/count;
        var it = data.getIterator();
        while(it.hasNext()) {
            var row = it.next();
            var yv = yinfo.getValue(row).getNumber();
            var ch = yv/(max-min)*190;

            var y = h-ch-50;
            var bh = ch;
            g.fillStyle = 'red';
            g.fillRect(x,y,bw-5,bh);
            g.fillStyle = 'black';
            g.fillText(''+xinfo.print(row),x+5,h-35);
            x += bw;
        }
    },
    render: function() {
        return <div>barchart:<br/><canvas ref='canvas' width='500' height='250'></canvas></div>
    }
});

module.exports = BarChart;