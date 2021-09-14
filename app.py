
from flask import Flask, render_template, request, redirect, url_for, jsonify

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

@app.route('/mypage/userinfo', methods=['GET'])
def userinfo_mypage():
    sample_receive = request.args.get('sample_give')
    print(sample_receive)

    return jsonify({'msg': '이 요청은 GET!'})

@app.route('/mypage/delete', methods=['GET'])
def delete_mypage():
    sample_receive = request.args.get('sample_give')
    print(sample_receive)
    # postId_receive = request.
    # db.mypage.delete_one({'name': postId_receive})
    return jsonify({'msg': '삭제 완료!'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)