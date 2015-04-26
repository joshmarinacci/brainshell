
var _global = new Context();

function Context() {
    var registry = {}
    this.register = function(symbol, value) {
        registry[symbol.name()] = value;
        console.log("registered",symbol.name());
    };
    this.lookup = function(symbol) {
        return registry[symbol.name()];
    }
}


exports.global = function() {
    return _global;
}