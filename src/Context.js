
var _global = new Context();

function Context() {
    var registry = {}
    this.register = function(symbol) {
        registry[symbol.name] = symbol;
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
    this.listSymbols = function() {
        var list = [];
        for(var name in registry) {
            list.push({
                name: name,
                symbol: registry[name]
            });
        }
        list.sort(function(a,b) {
            return a.name - b.name;
        });
        return list;
    }
}


exports.global = function() {
    return _global;
}