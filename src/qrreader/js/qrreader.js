/**
 * Created by male on 06.06.2016.
 */
(function () {
    $('#reader').html5_qrcode(function (data) {
            // do something when code is read
            console.log(data);
        },
        function (error) {
            $("#progressBar").remove();
        }, function (videoError) {
            console.warn(videoError);
        }
    );
})();