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
    notify: function() {
        this.cbs.forEach(function(cb) {
            cb();
        })
    },
    init: function() {
        var self = this;
        utils.GETJSON('http://localhost:30045/josh/docs').then(function(data) {
            self._docs = data;
            self.notify();
        });
    },
    getDocs: function() {
        return this._docs;
    },
    saveDoc: function(doc) {
        console.log("saving the doc",doc);
        utils.POSTJSON('http://localhost:30045/josh/docs/'+doc.id, doc).then(function(res) {
            console.log("saved!",res);
        });
    },
    createDoc: function() {
        var self = this;
        return utils.POSTJSON('http://localhost:30045/josh/createdoc',{}).then(function(doc){
            console.log("made a new, returning");
            self._docs.push(doc);
            return doc;
        });
    }
};


module.exports = DocsStore;