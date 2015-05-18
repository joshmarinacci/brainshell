var React = require('react');

var BarChart = React.createClass({
    componentDidMount: function() {
        this.drawCanvas(this.props.data.data, this.props.data.xaxis, this.props.data.yaxis);
    },
    componentWillReceiveProps: function(newProps) {
        this.drawCanvas(newProps.data.data, newProps.data.xaxis, newProps.data.yaxis);
    },
    drawCanvas: function(data, xaxisDef, yaxisDef) {
        var xaxis = xaxisDef.getValue().getString();
        var yaxis = yaxisDef.getValue().getString();
        console.log('axis def = ', xaxis, yaxis);
        var can = this.refs.canvas.getDOMNode();
        var g = can.getContext('2d');
        var w = 500;
        var h = 250;
        g.fillStyle = 'white';
        g.fillRect(0,0,w,h);

        var cinfos = data.getColumnInfos();
        //console.log('cinfios = ', cinfos);
        var xinfo = cinfos.filter(function(cinfo) { return cinfo.id() == xaxis})[0];
        var yinfo = cinfos.filter(function(cinfo) { return cinfo.id() == yaxis})[0];
        //console.log('infos = ', xinfo.id(), yinfo.id());

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
        console.log("max/min/count",max,min,count);

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
        console.log('this is a bar chart', this.props.data);
        return <div>barchart:<br/><canvas ref='canvas' width='500' height='250'></canvas></div>
    }
});

module.exports = BarChart;