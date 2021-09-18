//포스팅 삭제
function deleteMypage(postId) {
    console.log(typeof postId);
    $.ajax({
        type: 'POST',
        url: '/mypage/delete',
        data: {postId_give: postId},
        success: function (response) {
            alert(response['msg']);
            window.location.reload()
        }
    });
}

//쿠키삭제
function log_out() {
    $.removeCookie('mytoken', {path: '/'});
    alert("로그아웃 되었습니다.");
    window.location.href = "/"
}