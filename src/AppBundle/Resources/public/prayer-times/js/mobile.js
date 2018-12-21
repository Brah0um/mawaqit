/* global prayer */

// clic to go to mosque
$('#navigate').click(function (e) {
    var $url = "https://maps.google.com/maps?daddr=";
    var $platform = navigator.platform;

    if (($platform.indexOf("iPhone") != -1) || ($platform.indexOf("iPad") != -1) || ($platform.indexOf("iPod") != -1)) {
        $url = "maps://maps.google.com/maps?daddr=";
    }

    window.open($url + latitude + "," + longitude + "&amp;ll=");
});


$("#search").autocomplete({
    source: function (request, response) {
        $.ajax({
            url: $("#search").data("remote"),
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
        window.location.href = 'https://mawaqit.net/fr/' + ui.item.slug;
    }
});