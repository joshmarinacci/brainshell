/**
 * Created by josh on 5/26/15.
 */
exports.Parser = function() {
    var endpoint = "ws:45.33.14.88:50101";
    var ws = new WebSocket(endpoint);
    console.log("opening websocket to ", endpoint);
    ws.onopen = function () {
        console.log("connected to websocket endpoint", endpoint);
    };
    ws.onmessage = function (msg) {
        var payload = JSON.parse(msg.data);
        console.log("msg from publisher", payload.Publisher, 'type', payload.InformationType);
    };
    ws.onclose = function () {
        console.log("my connection closed");
    }

}