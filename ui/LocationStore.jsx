//console.log(window.location);
var location = window.location;
var params = {};

if (location.search.length > 1) {
    for (var aItKey, nKeyId = 0, aCouples = location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
        aItKey = aCouples[nKeyId].split("=");
        params[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]) : "";
    }
}

exports.hasDocId = function() {
    console.log(params);

    if(params.id) return true;
    return false;
};

exports.getDocId = function() {
    return params.id;
};

exports.setDoc = function(doc) {
    history.pushState(doc,doc.title,'./?id='+doc._id);
};