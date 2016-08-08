
function appendButtons()
{
    $('.upvote').click(function(){
        var linkid = $(this).attr("linkid");
        upLink(linkid);
    });

(function() {
    $('#addlinkform').on('submit', function(event)
    {
        var newPost = {
            newlinkurl:$('#newLinkField').val(),
            newlinkname:$('#newLinkName').val()
        }
        $.ajax({
            type:"PUT",
            url:"/Links/",
            contentType:'application/json;charset=utf-8',
            processData:'false',
            data: JSON.stringify(newPost),
            success:[getAllLinks,fertiglustig],
            statusCode: {
                401: function () {
                    alert("No Permission!");
                }
            }
        });
        event.preventDefault();
    });

    // var intervalID = window.setInterval(getAllLinks, 3000); // ms
})();