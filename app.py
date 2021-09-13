from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# 메인, 로그인, 회원가입, 마이페이지 연결
@app.route('/')
def mainpage():
    return render_template('mainpage.html')

@app.route('/userlogin/')
def loginpage():
    return render_template('login.html')

@app.route('/usersignup/')
def signuppage():
    return render_template('signup.html')

@app.route('/mypage/')
def mypage():
    return render_template('mypage.html')

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)