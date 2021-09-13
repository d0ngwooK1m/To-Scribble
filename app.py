from flask import Flask, render_template, request, redirect, url_for
from pymongo import MongoClient

app = Flask(__name__)

# 페이지 연결기능 여기서 작성해주세요!
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

# API 기능 여기서 작성해주세요!

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)