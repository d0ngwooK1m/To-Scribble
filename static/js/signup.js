function makeInfo() {
    let nick = $('#nick-id').val()
    let email = $('#email-id').val()
    let pw = $('#pw-id').val()
    let pw_check = $('#pw-check-id').val()

    $.ajax({
        type: "POST",
        url: "/api/usersignup/",
        data: {nickname_give: nick, email_give: email, pw_give: pw, pw_check_give: pw_check },
        success: function (response) {
            alert(response["msg"]);
            window.location.href = '/userlogin'
        }
    })
}