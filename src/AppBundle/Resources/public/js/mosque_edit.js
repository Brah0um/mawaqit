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