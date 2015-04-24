var registry = {}

exports.register = function(symbol, value) {
    registry[symbol.name()] = value;
};

exports.lookup = function(symbol) {
    return registry[symbol.name()];
}