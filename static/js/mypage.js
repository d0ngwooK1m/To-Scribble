function showUser() {
    $.ajax({
        type: 'GET',
        url: '/mypage/delete?sample_give=샘플데이터',
        data: {},
        success: function (response) {
            alert(response['msg']);
            window.location.reload()
        }
    });
}


function deleteMypage() {
    $.ajax({
        type: 'GET',
        url: '/mypage/delete?sample_give=샘플데이터',
        data: {},
        success: function (response) {
            alert(response['msg']);
            window.location.reload()
        }
    });
}