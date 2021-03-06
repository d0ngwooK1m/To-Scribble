//이메일 정규표현식
function isEmail(asValue) {
	var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
	return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

function makeInfo() {
    let nick = $('#nick-id').val()
	if (nick ==='guest'){
		alert('guest는 닉네임으로 사용할 수 없습니다ㅠ'); // 동일 닉네임 방지
	}
    let email = $('#email-id').val()
    let pw = $('#pw-id').val()
    let pw_check = $('#pw-check-id').val()
	if(pw !== pw_check) {
		return alert("이메일이나 비밀번호가 잘못되었습니다. 다시 확인해주세요!");
	}
	if (!isEmail(email)){  // 이메일 형식 확인
		alert("이메일 형식을 확인해주세요");
		return;
	}
    let file = $('#profile_pt')[0].files[0] // 한장의 사진 가져오기
    let form_data = new FormData() //text일 때는 상관없지만, file이 있을때는 form_data를 사용.
    form_data.append("file_give", file)
    form_data.append("nickname_give", nick)
    form_data.append("email_give", email)
    form_data.append("pw_give", pw)
    form_data.append("pw_check_give", pw_check)

    $.ajax({
        type: "POST",
        url: "/api/usersignup/",
        data: form_data, // give가 아닌 form_data를 사용
        cache: false, // 사진이 어떤 형태인줄 모르니, 밑에 3개를 False 시켜 기준 맞추기
        contentType: false,
        processData: false,
        success: function (response) {
            alert(response["msg"]);
			return (window.location.href = '/userlogin');
        },
        error: function (response) {
			return(alert(response['responseJSON']['msg'])); //error 일때 msg를 불러오는 방법
		},
    })
}

function previewImage(targetObj, View_area) {
	var preview = document.getElementById(View_area); //div id
	var ua = window.navigator.userAgent;

  	//ie일때(IE8 이하에서만 작동)
	if (ua.indexOf("MSIE") > -1) {
		targetObj.select();
		try {
			var src = document.selection.createRange().text; // get file full path(IE9, IE10에서 사용 불가)
			var ie_preview_error = document.getElementById("ie_preview_error_" + View_area);


			if (ie_preview_error) {
				preview.removeChild(ie_preview_error); //error가 있으면 delete
			}

			var img = document.getElementById(View_area); //이미지가 뿌려질 곳

			//이미지 로딩, sizingMethod는 div에 맞춰서 사이즈를 자동조절 하는 역할
			img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+src+"', sizingMethod='scale')";
		} catch (e) {
			if (!document.getElementById("ie_preview_error_" + View_area)) {
				var info = document.createElement("<p>");
				info.id = "ie_preview_error_" + View_area;
				info.innerHTML = e.name;
				preview.insertBefore(info, null);
			}
		}
  //ie가 아닐때(크롬, 사파리, FF)
	} else {
		var files = targetObj.files;
		for ( var i = 0; i < files.length; i++) {
			var file = files[i];
			var imageType = /image.*/; //이미지 파일일경우만.. 뿌려준다.
			if (!file.type.match(imageType))
				continue;
			var prevImg = document.getElementById("prev_" + View_area); //이전에 미리보기가 있다면 삭제
			if (prevImg) {
				preview.removeChild(prevImg);
			}
			var img = document.createElement("img");
			img.id = "prev_" + View_area;
			img.classList.add("obj");
			img.file = file;

            img.style.display = 'block';
            // img.style.marginLeft = '40%' ;
            img.style.marginbottom = '10px' ;
			img.style.width = '476px';
			img.style.height = '472px';
            $("#View_area").empty();

			preview.appendChild(img);
			if (window.FileReader) { // FireFox, Chrome, Opera 확인.
				var reader = new FileReader();
				reader.onloadend = (function(aImg) {
					return function(e) {
						aImg.src = e.target.result;
					};
				})(img);
				reader.readAsDataURL(file);
			} else { // safari is not supported FileReader
				//alert('not supported FileReader');
				if (!document.getElementById("sfr_preview_error_"
						+ View_area)) {
					var info = document.createElement("p");
					info.id = "sfr_preview_error_" + View_area;
					info.innerHTML = "not supported FileReader";
					preview.insertBefore(info, null);
				}
			}
		}
	}
}