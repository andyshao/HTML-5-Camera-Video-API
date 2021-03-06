$(function () {
    "use strict";

    const WEB_SOCKET_URL = 'ws://127.0.0.1:1337';
    const SERVER_TIMEOUT = 3000;

    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    // my color and name are assigned by the server
    var myColor = false, myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) {
        showErrorMessageThatWebSocketIsNotSupported();
        return;
    }

    var connection = new WebSocket(WEB_SOCKET_URL);
    connection.onopen = onConnectionOpen;
    connection.onerror = onConnectionError;
    connection.onmessage = onIncomingMessage;

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        sendMessageOnEnter(e.keyCode);
    });

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
        input.removeAttr('disabled');
        status.text('Choose name:');
    }
    function onConnectionError() {
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
        + 'connection or the server is down.' } ));
    }

    function onIncomingMessage(message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                    json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text,
                json.data.color, new Date(json.data.time));
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    }

    /**
     * Add message to the chat window
     */
    function addMessage(author, message, color, dt) {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': ' + message + '</p>');
    }

    function sendMessageOnEnter(keyCode) {
        if (keyCode === 13) {
            var msg = input.val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            input.val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user is their name
            if (myName === false) {
                myName = msg;
            }
        }
    }

    function showErrorMessageThatWebSocketIsNotSupported() {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t ' + 'support WebSockets.'}));
        input.hide();
        $('span').hide();
    }

});