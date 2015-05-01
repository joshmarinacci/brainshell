
var _global = new Context();

function Context() {
    var registry = {}
    this.register = function(symbol) {
        registry[symbol.name()] = symbol;
    };
    this.lookup = function(name) {
        return registry[name];
    };
    this.hasSymbol = function(name) {
        return (typeof registry[name] !== 'undefined');
    }
    this.dump = function() {
        for(var key in registry) {
            console.log(key,registry[key]);
        }
    }
}


exports.global = function() {
    return _global;
}