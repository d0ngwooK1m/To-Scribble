//퀴즈버튼, 그림버튼 작동에 필요한 변수들
let checkOpened = false;
let checkQuizBtnOpened = false;
const popupBtn = document.querySelector('.drawing-hide-button');
const quizBtn = document.querySelector('.quiz-hide-button');
const testBox = document.querySelector('.diary');
const quizBox = document.querySelector('.quiz');
const cardWrapper = document.querySelector('.card-wrapper');
const quizSubmitBtn = document.querySelector('.quiz-submit-button');
let quizAnswer;
let quizPostId;


//퀴즈 버튼 클릭했을 때 자신이 그린 그림과 내가 맞춘 그림을 제외한 랜덤한 그림을 불러오는 함수
function makeQuiz() {
    const quizImage = document.querySelector('.quiz-image');
    fetch('/getquiz')
        .then((response) => response.json())
        .then((response) => {
            // console.log(response);
            if (response["msg"] === "AllSolve") {
                return alert('더 이상 풀 퀴즈가 없습니다!')
            }
            else if (response["msg"] === "GET") {
                quizImage.src = response['quiz']['img'];
                quizAnswer = response['quiz']['weather'];
                quizPostId = response['quiz']['postId'];
            }
        })
};

//퀴즈 제출 버튼 클릭시 결과 알려주는 함수
quizSubmitBtn.addEventListener('click', () => {
    let answerOption = document.getElementById('my-answer');
    const myAnswer = answerOption.options[answerOption.selectedIndex].value;
    const postData = {
        post_id_give: quizPostId,
    }
    if (quizAnswer !== myAnswer) {
        return alert("땡! 다음기회에 도전해주세요😎")
    }
    else {
        fetch('/solve', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        })
            .then((response) => response.json())
            .then((response) => {
                // console.log(response);
                alert("당신의 눈썰미에 1점 추가!😉");
                window.location.href = '/';
            })
    }
});

//그림 그리기 버튼 클릭시 퀴즈와 겹치지 않고, 캔버스만 나오게 하는 기능
popupBtn.addEventListener('click', () => {
    if (checkOpened === false) {
        if (checkQuizBtnOpened === true) {
            checkQuizBtnOpened = false;
            quizBox.style.display = "none";
            testBox.style.display = "flex";
            cardWrapper.style.display = "flex";
            return checkOpened = true;
        }
        checkOpened = true;
        testBox.style.display = "flex";
        quizBox.style.display = "none";
        checkQuizBtnOpened = false;
    } else {
        checkOpened = false;
        testBox.style.display = "none";
    }
});

//퀴즈 버튼 클릭시 캔버스와 겹치지 않고 퀴즈만 나오고, 일기들을 숨기는 기능
quizBtn.addEventListener('click', () => {
    const checkGuest = document.getElementById('welcome').valueOf().innerText.split('').slice(0, 5).join('')  //guest
    if (checkGuest === 'guest') {
        return alert('회원가입을 해주세요!');
    }
   if (checkQuizBtnOpened === false) {
       if (checkOpened === true) {
           checkOpened = false;
           testBox.style.display = "none";
           quizBox.style.display = "flex";
           cardWrapper.style.display = "none";
           checkQuizBtnOpened = true;
           return makeQuiz();
       }
       checkQuizBtnOpened = true;
       quizBox.style.display = "flex";
       testBox.style.display = "none";
       checkOpened = false;
       cardWrapper.style.display = "none";
       return makeQuiz();
   } else {
       checkQuizBtnOpened = false;
       quizBox.style.display = "none";
       cardWrapper.style.display = "flex";
   }
});

//캔버스 그리기
//캔버스 그리기에 필요한 변수 저장
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');
const radioColorCtrl = document.querySelector('.radio-color-wrap');
const submitBtn = document.querySelector('.diary-submit-button');
const penBtn = document.querySelector('.pen');
const eraserBtn = document.querySelector('.eraser');
const clearBtn = document.querySelector('.clear');
let drawingMode = false;
let drawingTool = "pen";
let colorVal = 'black';

//그리기 툴 선택 함수 = 필요에 따라 지우개, 연필로 변경, 크기 조정
const chooseDrawingTool = (e) => {
    const toolSize = document.querySelector('#myRange').value;
    const bound = canvas.getBoundingClientRect();
    const resizedX = e.layerX * (canvas.width / bound.width);
    const resizedY = e.layerY  * (canvas.width / bound.width);
    if (drawingTool === "pen") {
        // console.log(e)
        context.globalCompositeOperation = "source-over";
        context.beginPath();
        context.arc(resizedX, resizedY, toolSize*2, 0, Math.PI * 2, false);
        context.fill();
    } else if (drawingTool === 'eraser') {
        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(resizedX, resizedY, toolSize*2, 0, Math.PI * 2, false);
        context.fill();
    }
};

//마우스 클릭 시 그리기 이벤트 발생
canvas.addEventListener('mousedown', (e) => {
    drawingMode = true;
    // console.log(drawingMode);
    chooseDrawingTool(e);
});

//마우스 움직일 시 그리기 이벤트 발생
canvas.addEventListener('mousemove', (e) => {
    if (!drawingMode) return;
    chooseDrawingTool(e);
});

//마우스 땠을 시 그리기 종료 기능
canvas.addEventListener('mouseup', () => {
    drawingMode = false;
});

//색깔 버튼 클릭 시 색깔 바뀌게 하는 기능
radioColorCtrl.addEventListener('click', (e) => {
    colorVal = e.target.getAttribute('data-color');
    context.fillStyle = colorVal;
    drawingTool = "pen";
});

//연필 버튼 클릭 시 기능 펜으로 바꾸는 기능
penBtn.addEventListener('click', () => {
    drawingTool = "pen";
});

//지우개 버튼 클릭 시 지우개로 바꾸는 기능
eraserBtn.addEventListener('click', () => {
    drawingTool = "eraser";
});

//새로 그리기 버튼 클릭시 새로 그려주는 기능
clearBtn.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});


//일기 포스팅(등록) API
//등록에 필요한 변수 지정
let weather_give = document.getElementById('weather-select');
const comment_give = document.querySelector('.diary-comment');

//내 기분 알리기 버튼 클릭 시 필요한 정보를 담아 백엔드로 전송하고 페이지 새로고침 해주는 기능
submitBtn.addEventListener('click', () => {
    //회원이 아닐 시(환영문구에서 문자열이 guest이면) 해당 기능을 실행하지 않음
    const checkGuest = document.getElementById('welcome').valueOf().innerText.split('').slice(0,5).join('')  //guest
    if (checkGuest==='guest'){
        return alert('회원가입을 해주세요!');
    }
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth();
    if (month < 10) {
        month = `0${today.getMonth()+1}`;
    }
    let date = today.getDate();
    if (date < 10) {
        date = `0${today.getDate()}`
    }
    let date_give = document.getElementById('date-box').value;
    //아무 날짜도 입력하지 않고 전송 시 현재 날짜로 보내지게 하는 기능
    console.log(date_give)
    if (date_give == "") {
        date_give = `${year}-${month}-${date}`;
    }
    const url = canvas.toDataURL('image/png');
    let weather = weather_give.options[weather_give.selectedIndex].value;
    //아무 기능도 입력하지 않고 전송 시 기본 기분으로 보내지게 하는 기능
    if(weather == '기분')
        weather = '😑'
    const postData = {
        img: url,
        date: date_give,
        weather: weather,
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
    $.ajax({
                    type: "GET",
                    url: "/getquiz",
                    data: {},
                    success: function (response) {
                        console.log(response['quiz']);
                    }
                })
    // $.removeCookie('mytoken', {path: '/'});
    // alert("로그아웃 되었습니다.")
    // window.location.href = "/"
}

function toggle_like(post_id) {
    // console.log(post_id)
    const checkGuest = document.getElementById('welcome').valueOf().innerText.split('').slice(0,5).join('')
    if (checkGuest==='guest'){
        return alert('회원가입을 해주세요!');
    }
    let $a_like = $(`#${post_id} a[aria-label='${"heart"}']`)
    let $i_like = $a_like.find("i")
    if ($i_like.hasClass("fa-heart-o")) {
        //여기는 좋아요!
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