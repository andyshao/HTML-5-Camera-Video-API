$(function () {
    "use strict";

    const DEFAULT_FRAME_RATE = 100;
    const WIDTH = 600;

    window.CanvasHandler = { onNewMessage: onNewMessage};

    var activateRemoteControlButton = $('#activateRemoteControlButton');
    var disableRemoteControlSection = $('#disableRemoteControlSection');
    var progressBar = $('#progressBar');
    var video = document.getElementById('video');
    var canvas = $('#canvas');
    var con = canvas[0].getContext('2d');
    var isStreaming = false;
    var isRemoteControlled = false;
    var currentInterval;
    var filter;
    var height;


    init();

    function init() {
        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                {
                    video: true,
                    audio: false
                },
                function (stream) {
                    var url = window.URL || window.webkitURL;
                    video.src = url ? url.createObjectURL(stream) : stream;
                    video.play();
                },
                function (error) {
                    alert('Something went wrong. (error code ' + error.code + ')');
                }
            );
            video.addEventListener('canplay', onCanPlay, false);
            video.addEventListener('play', onPlay, false);
            activateRemoteControlButton.click(activateRemoteControl);
            disableRemoteControlSection.click(disableRemoteControl);
        }
        else {
            alert('Sorry, the browser you are using doesn\'t support getUserMedia');
        }

    }

    function onCanPlay() {
        progressBar.value = 50;
        if (!isStreaming) {
            // videoWidth isn't always set correctly in all browsers
            if (video.videoWidth > 0) height = video.videoHeight / (video.videoWidth / WIDTH);
            canvas.attr('width', WIDTH);
            canvas.attr('height', height);
            // Reverse the canvas image
            con.translate(WIDTH, 0);
            con.scale(-1, 1);
            isStreaming = true;
            progressBar.css('visibility', 'hidden');
            progressBar.val(75);
        }
    }

    function onPlay() {
        clearInterval(currentInterval);
        currentInterval = setInterval(function () {
            if (!isStreaming || video.paused || video.ended) return;

            con.fillRect(0, 0, WIDTH, height);
            con.drawImage(video, 0, 0, WIDTH, height);

            if(isRemoteControlled) {
                applyFilter();
            } else {
                resetCanvas();
            }
        }, 1000 / DEFAULT_FRAME_RATE);
    }

    function activateRemoteControl() {
        isRemoteControlled = true;
        activateRemoteControlButton.css("visibility", 'hidden');
        disableRemoteControlSection.css("visibility", 'visible');
    }

    function disableRemoteControl() {
        isRemoteControlled = false;
        activateRemoteControlButton.css("visibility", 'visible');
        disableRemoteControlSection.css("visibility", 'hidden');
    }

    function applyFilter() {
        var imageData = con.getImageData(0, 0, WIDTH, height);
        var data = imageData.data;

        switch (filter) {
            case 'negative':
                makeNegative();
                break;
            case 'grey':
                makeGreyscale();
                break;
            case 'sepia':
                makeSepia();
                break;
            case 'green':
                switchRedAndBlue();
                break;
            case 'blue':
                switchRedAndGreen();
                break;
            case 'red':
                switchGreenAndBlue();
                break;
            case 'fadeout':
                fadeOut();
                break;
            case 'blur':
                blur();
                break;
            default:
                resetCanvas();
                break;

        }
        con.putImageData(imageData, 0, 0);

        function makeNegative() {
            for (var i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
        }

        function makeGreyscale() {
            for (var i = 0; i < data.length; i += 4) {
                var bright = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
                data[i] = bright;
                data[i + 1] = bright;
                data[i + 2] = bright;
            }
        }

        function makeSepia() {
            for (var i = 0; i < data.length; i += 4) {
                var avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
                data[i] = avg + 100;
                data[i + 1] = avg + 50;
                data[i + 2] = avg;
            }
        }

        function switchRedAndBlue() {
            for (var i = 0; i < data.length; i += 4) {
                var tmp = data[i];
                data[i] = data[i + 2];
                data[i + 2] = tmp;
            }
        }

        function switchRedAndGreen() {
            for (var i = 0; i < data.length; i += 4) {
                var tmp = data[i + 1];
                data[i + 1] = data[i];
                data[i] = tmp;
            }
        }

        function switchGreenAndBlue() {
            for (var i = 0; i < data.length; i += 4) {
                var tmp = data[i + 2];
                data[i + 2] = data[i + 1];
                data[i + 1] = tmp;
            }
        }

        function fadeOut() {
            for (var i = 0; i < data.length; i += 4) {
                data[i + 3] = 255 * (data.length - i) / data.length;
            }
        }

        function blur() {
            canvas.css("-webkit-filter", "blur(10px)");
            canvas.css("filter", "blur(10px)");
        }
    }

    function resetCanvas() {
        canvas.css("-webkit-filter", "");
        canvas.css("filter", "");
    }

    function onNewMessage(message) {
        filter = message.replace(/\s+/g, '').toLowerCase();
    }

});