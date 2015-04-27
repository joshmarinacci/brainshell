
var _global = new Context();

function Context() {
    var registry = {}
    this.register = function(symbol) {
        registry[symbol.name()] = symbol;
        console.log("registered",symbol.name());
    };
    this.lookup = function(name) {
        return registry[name];
    };
    this.dump = function() {
        for(var key in registry) {
            console.log(key,registry[key]);
        }
    }
}


exports.global = function() {
    return _global;
}