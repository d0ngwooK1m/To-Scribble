
$(document).ready(function () {
    showUser();
});

function showUser() {
    $.ajax({
        type: 'GET',
        url: '/mypage/userinfo?sample_give=email',
        data: {},
        success: function (response) {
            alert(response['msg']);
            // window.location.reload()
        }
    });
}


function deleteMypage(postId) {
    $.ajax({
        type: 'GET',
        url: '/mypage/delete?postId_give=postId',
        data: {},
        success: function (response) {
            alert(response['msg']);
            window.location.reload()
        }
    });
}