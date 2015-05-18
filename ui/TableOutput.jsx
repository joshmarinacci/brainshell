var React = require('react');
var DataUtil = require('../src/DataUtil');

module.exports = React.createClass({
    componentDidMount: function() { },
    renderRow: function(row, infos, count) {
        var cols = infos.map(function(info,i){
            return <td key={'cell_'+count+'_'+i}>{info.print(row)}</td>
        });
        return <tr key={'rowx_'+count}><td className='row-header' key={'cell_head'}>{count+1}</td>{cols}</tr>;
    },
    renderTable: function(data, name) {
        var infos = data.getColumnInfos();
        var itr = data.getIterator();
        var rows = [];
        var count = 0;
        var early = false;
        while(itr.hasNext()) {
            rows.push(this.renderRow(itr.next(),infos,count));
            count++;
            if(count > 100) {
                early = true;
                break;
            }
        }
        if(early) {
            name += " ... plus more";
        }

        var headers = infos.map(function(info) {
            return <th>{info.title()}</th>;
        });

        return <table className='grow'>
            <caption>{name}</caption>
            <thead><th className='row-header'>#</th>{headers}</thead>
            <tbody>{rows}</tbody>
        </table>;
    },
    render: function() {
        var data = this.props.data;
        //console.log("is 1d = ",DataUtil.is1D(data));
        //console.log("is 2d = ",DataUtil.is2D(data));
        //console.log("is 3d = ",DataUtil.is3D(data));
        //list
        if(DataUtil.is3D(data)) {
            var it = data.getIterator();
            var output = [];
            while(it.hasNext()) {
                var val = it.next();
                //assume this is a key value pair
                //console.log("val = " + val.toString());
                var name = val.getKey();
                var table = val.getValue();
                output.push(this.renderTable(table,name));
            }
            return <div className='grow scroll result'>{output}</div>;
        }
        return <div className='grow scroll result'>{this.renderTable(this.props.data,'result')}</div>;
    }
});
