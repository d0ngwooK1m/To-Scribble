function login() {
    let email = $('#useremail-id').val()
    let pw = $('#userpw-id').val()

    $.ajax({
        type: "POST",
        url: '/api/userlogin/',
        data: {email_give: email, pw_give: pw},
        success: function (response) {
            if (response['result'] == 'success') {
                // 받아온 token을 mytoken이라는 key 값으로 cookie에 저장합니다.
                $.cookie('mytoken', response['token'],{path: '/'});
                alert('로그인 완료!')
                window.location.href = '/'
            } else {
                // 로그인이 안되면 에러메시지를 띄웁니다.
                alert(response['msg']);

            }
        }
    })
}

function main(){
    window.location.href = "/"
}

