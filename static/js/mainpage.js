$(document).ready(function () {
                // showAllpost();
            });

let checkOpened = false;
const popupBtn = document.querySelector('.drawing-hide-button');
const testBox = document.querySelector('.diary');

// const openCheck = () => {
//     if (testBox.style.display === "none") return
// };
//
// openCheck();

popupBtn.addEventListener('click', () => {
    if (checkOpened === false) {
        checkOpened = true;
        testBox.style.display = "flex";
    } else {
        checkOpened = false;
        testBox.style.display = "none";
    }
});
function showAllpost() {
                $.ajax({
                    type: "GET",
                    url: "/allpost",
                    data: {},
                    success: function (response) {
                        let posts = response['all_post']
                        console.log(posts)
                            for (let i = posts.length-1; i >= 0; i--)
                            {
                                //<img className="is-rounded" src="../static/img/pepegood.jpg">
                                let imageurl = posts[i]['img']
                                let text = posts[i]['comment']
                                let date = posts[i]['date']
                                let weather = posts[i]['weather']

                                let temp_html = `
                                    <div class="card">
                                        <div class="card-image">
                                            <figure class="image is-4by3">
                                                <img src="${imageurl}" >
                                            </figure>
                                        </div>
                                        <div class="card-content">
                                            <div class="content">
                                                ${text}
                                                <br>
                                                <time datetime="2016-1-1">${date}</time>
                                                <br>
                                                <weather>${weather}</weather>
                                            </div>
                                        </div>
                                    </div>
                                    `
                                $('#card-box').append(temp_html)
                            }
                    }
                })
            }
//canvas
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');
const radioColorCtrl = document.querySelector('.radio-color-wrap');
const submitBtn = document.querySelector('.diary-submit-button');
const penBtn = document.querySelector('.pen');
const eraserBtn = document.querySelector('.eraser');
const clearBtn = document.querySelector('.clear');
// const imageBtn = document.querySelector('.send-image');
let drawingMode = false;
let drawingTool = "pen";
let colorVal = 'black';

// context.arc(100, 100, 50, 0, Math.PI * 2, false);

const chooseDrawingTool = (e) => {
    if (drawingTool === "pen") {
        // console.log(e)
        context.globalCompositeOperation = "source-over";
        context.beginPath();
        context.arc(e.layerX, e.layerY, 10, 0, Math.PI * 2, false);
        context.fill();
    } else if (drawingTool === 'eraser') {
        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(e.layerX, e.layerY, 10, 0, Math.PI * 2, false);
        context.fill();
    }
};

canvas.addEventListener('mousedown', (e) => {
    drawingMode = true;
    // console.log(drawingMode);
    chooseDrawingTool(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawingMode) return;
    chooseDrawingTool(e);
});

canvas.addEventListener('mouseup', () => {
    drawingMode = false;
});

radioColorCtrl.addEventListener('click', (e) => {
    colorVal = e.target.getAttribute('data-color');
    // console.log(colorVal);
    context.fillStyle = colorVal;
    drawingTool = "pen";
});

penBtn.addEventListener('click', () => {
    drawingTool = "pen";
});

eraserBtn.addEventListener('click', () => {
    drawingTool = "eraser";
});

clearBtn.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});


//일기 포스팅(등록) API
const url = canvas.toDataURL('image/png');
const date_give = document.querySelector('.diary-date');
let weather_give = document.getElementById('weather-select');
// weather_give = weather_give.options[weather_give.selectedIndex].value;
const comment_give = document.querySelector('.diary-comment');

submitBtn.addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const postData = {
        img: url,
        date: date_give.value,
        weather: weather_give.options[weather_give.selectedIndex].value,
        comment: comment_give.value,
    }

    fetch('/mainpage/post', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
        .then((response) => response.json())
        .then((response) => {
            // console.log(response);
            alert(response["result"]);
            window.location.href = '/';
        })
});
function log_out() {
    $.removeCookie('mytoken', {path: '/'});
    alert("로그아웃 되었습니다.")
    window.location.href = "/"
}

function toggle_like(post_id) {
    console.log(post_id)
    let $a_like = $(`#${post_id} a[aria-label='${"heart"}']`)
    let $i_like = $a_like.find("i")
    if ($i_like.hasClass("fa-heart-o")) {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                action_give: "like"
            },
            success: function (response) {
                $i_like.addClass("fa-heart").removeClass("fa-heart-o")
                console.log(response["count"])
                $a_like.find("span.like-num").text(response["count"])

            }
        })
    }
    else{
        //여기는 좋아요를 취소한거임
        $.ajax({
        type: "POST",
        url: "/update_like",
        data: {
            post_id_give: post_id,
            action_give: "unlike"
        },
        success: function (response) {
            $i_like.addClass("fa-heart-o").removeClass("fa-heart")
            console.log(response["count"])
            $a_like.find("span.like-num").text(response["count"])
            }
        })
    }
}



