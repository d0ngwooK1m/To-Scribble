### 1. 프로젝트 제목 및 설명
To-Scribble  
> Today, Tomorrow + Scribble의 합성어로서,  
항해 중에 느낀 감정을 그림이나 낙서, 짧은 글로 표현해  
 여러 사용자들과 공감할 수 있는 사이트😉

 ### 2. 와이어 프레임
 첨부된 pdf파일 참조  
 메인페이지를 기준으로 로그인, 회원가입, 마이페이지 총 4페이지 기준이며, 기능 및 흐름 표현

 ### 3. 개발해야하는 기능들
 |기능|Method|URL|Request|Response|
|------|---|---|---|---|
|로그인|POST|/user/login|{"email": user["email"]"password": user["password"],}|{"response": "success"}
|회원가입|POST|/user/signup|{"nickname": user["nickname"],"email": user["email"],"password": user["password"],"passwordCheck": user["passwordCheck"],}|{"response": "success"}
|로그아웃|GET|/user/logout||{"response": "success"}
|메인페이지 작성글 보기|GET|/mainpage/view||DB 모든 작성글
|그림 포스팅|POST|/mainpage/post|{"id": uuid.uuid.hex(),"post_id": uuid.uuid.hex(),"image": user["image"],"date": user["date"],"weather": user["weather"],"comment": user["comment"],"like": 0}|{"response": "success"}
|마이페이지 작성글 보기|GET|/mypage/view|{"email": email,}|작성자가 일치하는 DB 모든 작성글
|포스팅 삭제|GET|/mypage/delete|{"post_id": postId,}|{"response": "success"}
|마이페이지 회원정보 불러오기|GET|/mypage/userinfo|{"email": email,}|{"nickname":nickname,"email": email,"password":password,}