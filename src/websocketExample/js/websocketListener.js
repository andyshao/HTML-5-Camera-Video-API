$(function () {
    "use strict";

    const SERVER_TIMEOUT = 3000;

    var errorContent = $('#errorContent');

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) {
        showErrorMessageThatWebSocketIsNotSupported();
        return;
    }

    var connection = new WebSocket('ws://127.0.0.1:1337');
    connection.onopen = onConnectionOpen;
    connection.onerror = onConnectionError;
    connection.onmessage = onIncomingMessage;

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                + 'with the WebSocket server.');
        }
    }, SERVER_TIMEOUT);


    function onConnectionOpen() {
        console.log("connection setup");
    }
    function onConnectionError() {
        errorContent.html($('<p>', { text: 'Sorry, but there\'s some problem with your ' + 'connection or the server is down.' } ));
    }

    function onIncomingMessage(message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.error('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (json.type === 'message' && CanvasHandler) { // it's a single message
            CanvasHandler.onNewMessage(json.data.text);
        }
    }

    function showErrorMessageThatWebSocketIsNotSupported() {
        errorContent.html($('<p>', { text: 'Sorry, but your browser doesn\'t ' + 'support WebSockets.'}));
    }

});