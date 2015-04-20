/**
 * Created by josh on 4/20/15.
 */

exports.asCode = function asCode(obj) {
    if(obj.type == 'symbol') {
        return obj.name();
    }
    return obj.toCode();
};

