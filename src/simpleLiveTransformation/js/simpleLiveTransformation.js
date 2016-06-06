/**
 * Created by male on 06.06.2016.
 */
(function () {

    window.addEventListener('DOMContentLoaded', function () {
        const DEFAULT_FRAME_RATE = 100;
        const FANCY_FRAME_RATE = 1;
        var isStreaming = false,
            video = document.getElementById('video'),
            canvas = document.getElementById('canvas'),
            toggleFancyButton = document.getElementById('toggleFancy'),
            progressBar = document.getElementById('progressBar');
        var con = canvas.getContext('2d');
        var width = 600, height = 420;
        var currentInterval = undefined;
        var isFancy = false, fancyState = 0;


        initGetUserMedia();
        video.addEventListener('canplay', onCanPlay, false);
        video.addEventListener('play', onPlay, false);


        toggleFancyButton.addEventListener('click', function () {
            isFancy = !isFancy;
            onPlay();
        }, false);

        function initGetUserMedia() {
            // Cross browser
            navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
            if (navigator.getUserMedia) {
                // Request access to video only
                navigator.getUserMedia(
                    {
                        video: true,
                        audio: false
                    },
                    function (stream) {
                        // Cross browser checks
                        var url = window.URL || window.webkitURL;
                        video.src = url ? url.createObjectURL(stream) : stream;
                        // Set the video to play
                        video.play();
                    },
                    function (error) {
                        alert('Something went wrong. (error code ' + error.code + ')');
                    }
                );
            }
            else {
                alert('Sorry, the browser you are using doesn\'t support getUserMedia');
            }
        }

        function onCanPlay() {
            progressBar.value = 50;
            if (!isStreaming) {
                // videoWidth isn't always set correctly in all browsers
                if (video.videoWidth > 0) height = video.videoHeight / (video.videoWidth / width);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                // Reverse the canvas image
                con.translate(width, 0);
                con.scale(-1, 1);
                isStreaming = true;
                progressBar.value = 75;
            }
        }

        function onPlay() {
            clearInterval(currentInterval);
            currentInterval = setInterval(function () {
                if (!isStreaming || video.paused || video.ended) return;

                hideProgressBarAndShowCanvas();
                con.fillRect(0, 0, width, height);
                con.drawImage(video, 0, 0, width, height);
                if (isFancy) {
                    goToNextFancyState()
                } else {
                    resetCanvas();
                }
            }, 1000 / (isFancy ? FANCY_FRAME_RATE : DEFAULT_FRAME_RATE));
        }

        function goToNextFancyState() {
            var imageData = con.getImageData(0, 0, width, height);
            var data = imageData.data;
            switch (fancyState++) {
                case 0:
                    makeNegative();
                    break;
                case 1:
                    makeGreyscale();
                    break;
                case 2:
                    makeSepia();
                    break;
                case 3:
                    switchRedAndBlue();
                    break;
                case 4:
                    switchRedAndGreen();
                    break;
                case 5:
                    switchGreenAndBlue();
                    break;
                case 6:
                    fadeOut();
                    break;
                default:
                    fancyState = 0;
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

        }

        function resetCanvas() {
            var imageData = con.getImageData(0, 0, width, height);
            con.putImageData(imageData, 0, 0);
        }

        function hideProgressBarAndShowCanvas() {
            canvas.style.visibility = "visible";
            progressBar.remove();
        }

    })
})();