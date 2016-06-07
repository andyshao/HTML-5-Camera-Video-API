$(function () {
    "use strict";

    const DEFAULT_FRAME_RATE = 100;
    const WIDTH = 600;
    const HEIGHT = 420;

    var activateRemoteControlButton = document.getElementById('activateRemoteControlButton');
    var disableRemoteControlSection = document.getElementById('disableRemoteControlSection');
    var progressBar = document.getElementById('progressBar');
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var con = canvas.getContext('2d');
    var isStreaming = false;
    var isRemoteControlled = false;
    var currentInterval;
    var filter;

    init();

    var canvasHandler = { onNewMessage: onNewMessage};
    window.CanvasHandler = canvasHandler;
    return;

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
            activateRemoteControlButton.addEventListener('click', activateRemoteControl, false);
            disableRemoteControlSection.addEventListener('click', disableRemoteControl, false);
        }
        else {
            alert('Sorry, the browser you are using doesn\'t support getUserMedia');
        }

    }

    function onCanPlay() {
        progressBar.value = 50;
        if (!isStreaming) {
            // videoWidth isn't always set correctly in all browsers
            canvas.setAttribute('width', WIDTH);
            canvas.setAttribute('height', HEIGHT);
            // Reverse the canvas image
            con.translate(WIDTH, 0);
            con.scale(-1, 1);
            isStreaming = true;
            progressBar.style.visibility = 'hidden';
            progressBar.value = 75;
        }
    }

    function onPlay() {
        clearInterval(currentInterval);
        currentInterval = setInterval(function () {
            if (!isStreaming || video.paused || video.ended) return;

            con.fillRect(0, 0, WIDTH, HEIGHT);
            con.drawImage(video, 0, 0, WIDTH, HEIGHT);

            if(isRemoteControlled) {
                applyFilter();
            } else {
                resetCanvas();
            }
        }, 1000 / DEFAULT_FRAME_RATE);
    }

    function activateRemoteControl() {
        isRemoteControlled = true;
        activateRemoteControlButton.style.visibility = 'hidden';
        disableRemoteControlSection.style.visibility = 'visible';
    }

    function disableRemoteControl() {
        isRemoteControlled = false;
        activateRemoteControlButton.style.visibility = 'visible';
        disableRemoteControlSection.style.visibility = 'hidden';
    }

    function applyFilter() {
        var imageData = con.getImageData(0, 0, WIDTH, HEIGHT);
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
            $("#canvas").css("-webkit-filter", "blur(10px)");
            $("#canvas").css("filter", "blur(10px)");
        }
    }

    function resetCanvas() {
        $("#canvas").css("-webkit-filter", "");
        $("#canvas").css("filter", "");
    }

    function onNewMessage(message) {
        filter = message.replace(/\s+/g, '').toLowerCase();
    }

});