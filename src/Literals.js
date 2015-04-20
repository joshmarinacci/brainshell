var Q = require('q');
/**
 * Created by josh on 4/20/15.
 */

var Literal = {
    makeNumber: function(jsnum) {
        return {
            kind:'literal',
            value: function() {
                return Q.fcall(function() {
                    return jsnum;
                });
            },
            toCode: function() {
                return jsnum;
            },
            toString: function() {
                return 'LITERAL ' + jsnum;
            }
        }
    }
};

module.exports = Literal;