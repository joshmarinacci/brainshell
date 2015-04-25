/**
 * Created by josh on 4/24/15.
 */
var utils = require('../src/utils');

var DocsStore = {
    cbs:[],
    _docs:[],
    on:function(type,cb) {
        this.cbs.push(cb);
    },
    notify: function(type) {
        this.cbs.forEach(function(cb) {
            cb(type);
        })
    },
    init: function() {
        var self = this;
        utils.GETJSON('http://localhost:30045/josh/docs').then(function(data) {
            self._docs = data;
            self._docs.forEach(function(doc) {
                doc.expressions.forEach(function(expr) {
                   if(!expr.id) {
                       console.log("missing an id");
                       expr.id = utils.makeId('expression');
                   }
                });
            });
            self.notify('load');
        });
    },
    getDocs: function() {
        return this._docs;
    },
    saveDoc: function(doc) {
        utils.POSTJSON('http://localhost:30045/josh/docs/'+doc.id, doc).then(function(res) {
            //console.log("saved!",res);
        });
    },
    createDoc: function() {
        var self = this;
        return utils.POSTJSON('http://localhost:30045/josh/createdoc',{}).then(function(doc){
            self._docs.push(doc);
            self.notify('create');
            return doc;
        });
    },
    deleteDoc: function(doc) {
        var self = this;
        var n = self._docs.indexOf(doc);
        console.log("found index to delete",n);
        self._docs.splice(n,1);
        self.notify('delete');
        return utils.POSTJSON('http://localhost:30045/josh/deletedoc',doc).then(function(doc) {
            console.log("delete was successsful");
        });
    },
    insertExpressionAfter: function(doc,expr,index) {
        console.log("doc = ",doc);
        console.log("inserting after expression",expr,index);
        var exp = {
            type:'code',
            content:'1+1',
            id:utils.makeId('expression')
        };
        doc.expressions.splice(index+1,0,exp);
        console.log("inserted at ", index+1);
        this.notify('update');
    }
};


module.exports = DocsStore;