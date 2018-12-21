$("#user_complete").autocomplete({
    source: function (request, response) {
        $.ajax({
            url: $("#user_complete").data("remote"),
            dataType: "json",
            data: {
                term: request.term
            },
            success: function (data) {
                response(data);
            }
        });
    },
    minLength: 2,
    select: function (event, ui) {
        $("#user").val(ui.item.id);
    }
});


function typeDisplayHandler() {
    $type = $("#type");
    $(".mosque-block, .home-block").addClass("hidden");

    if ($type.val()) {
        $("." + $type.val() + "-block").removeClass("hidden");

        if ($type.val() === 'home') {
            $("#address").removeAttr('required');
            $("#justificatoryFile_file").removeAttr('required');
            $("#file1_file").removeAttr('required');
        }
    }
}

$("#type").bind("change", function (event) {
    typeDisplayHandler();
});

typeDisplayHandler();

function initMap() {
    var lat= parseFloat($("#latitude").val());
    var lng= parseFloat($("#longitude").val());
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: lat, lng: lng}
    });
    new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});
    google.maps.event.addListener(map, "click", function (e) {
        var latLng = e.latLng;
        $("#latitude").val(latLng.lat());
        $("#longitude").val(latLng.lng());
    });
}