/**
 * Created by male on 06.06.2016.
 */
(function () {

    window.addEventListener('DOMContentLoaded', function () {
        const DEFAULT_FRAME_RATE = 30;
        const DELAY_RATE = 10;
        var isStreaming = false,
            video = document.getElementById('video'),
            canvas = document.getElementById('canvas'),
            toggleReplayButton = document.getElementById('toggleReplay'),
            progressBar = document.getElementById('progressBar');
        var con = canvas.getContext('2d');
        var width = 600, height = 420;
        var currentInterval = undefined;
        var isDelayed = false, fancyState = 0;
        var cache = [];


        initGetUserMedia();
        video.addEventListener('canplay', onCanPlay, false);
        video.addEventListener('play', onPlay, false);


        toggleReplayButton.addEventListener('click', function () {
            isDelayed = !isDelayed;
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
                if (isDelayed) {
                    delay()
                } else {
                    resetCanvas();
                }
            }, 1000 / DEFAULT_FRAME_RATE);
        }

        function delay() {
            var imageData = con.getImageData(0, 0, width, height);
            cache.push(imageData);

            var bufferProgress = (100 / DELAY_RATE) * cache.length / DEFAULT_FRAME_RATE;

            if(bufferProgress >= 100) {
                progressBar.style.visibility = "hidden";
                con.putImageData( cache.shift(), 0, 0);
            } else {
                progressBar.style.visibility = "visible";
                progressBar.value = bufferProgress;
            }
        }

        function resetCanvas() {
            var imageData = con.getImageData(0, 0, width, height);
            con.putImageData(imageData, 0, 0);
        }

        function hideProgressBarAndShowCanvas() {
            canvas.style.visibility = "visible";
            progressBar.style.visibility = "hidden";
        }

    })
})();