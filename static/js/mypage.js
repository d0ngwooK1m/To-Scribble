
$(document).ready(function () {
    // showUser();
    // showmypost();
});

function showUser() {
    $.ajax({
        type: 'GET',
        url: '/mypage/userinfo',
        data: {},
        success: function (response) {
            // window.location.reload()
        }
    });
}

function showmypost() {
    $.ajax({
        type: 'GET',
        url: '/mypage/showmypost?sample_give=3',
        data: {},
        success: function (response) {
            let my_post = response['my_posts']

            for (let i = 0; i < my_post.length; i++) {
                let imageurl = my_post[i]['image']
                let text = my_post[i]['text']
                let date = my_post[i]['date']
                let weather = my_post[i]['weather']
                let temp_html = `
                <div class="card">
                    <div class="card-image">
                        <figure class="image is-4by3">
                            <img src=${imageurl} alt="Placeholder image">
                        </figure>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <div class="content_text">
                                ${text}
                            </div>
                            <div>
                                <br>
                                <time datetime="2016-1-1">1 Jan 2016</time>
                                <weather>☀</weather>
                            </div>
                            <button onclick="deleteMypage()" class="delete"></button>
                        </div>
                    </div>
                    <button class="button is-danger">
                        Delete post
                    </button>

                        </div>
                    </div>
                </div>`
                $('#card-box').append(temp_html)
            }

        }
    });
}


function deleteMypage(postId) {
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

function log_out() {
    $.removeCookie('mytoken', {path: '/'});
    alert("로그아웃 되었습니다.");
    window.location.href = "/"
}
