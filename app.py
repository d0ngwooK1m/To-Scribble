
from flask import Flask, render_template, request, redirect, url_for, jsonify
from pymongo import MongoClient
import random
import jwt
import hashlib
import datetime

app = Flask(__name__)
SECRET_KEY = 'secret'
#app.secret_key = 'tmxmflddmfhdkanrjsk'
client = MongoClient('localhost', 27017)
db = client.To_Scribble


# 페이지 연결기능 여기서 작성해주세요!
@app.route('/')
def mainpage():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY , algorithms=['HS256'])
        user_info = db.user.find_one({"email": payload['email']})
        return render_template('mainpage.html')
    except jwt.exceptions.DecodeError:
        return redirect(url_for("loginpage", msg="로그인 정보가 존재하지 않습니다."))


@app.route('/userlogin/')
def loginpage():
    msg = request.args.get("msg")
    return render_template('login.html', msg = msg)

@app.route('/usersignup/')
def signuppage():
    return render_template('signup.html')

@app.route('/mypage/')
def mypage():
    return render_template('mypage.html')

## 로그인 HTML을 주는 기능
# API 기능 여기서 작성해주세요!


# 일기 포스팅(등록) API
@app.route('/mainpage/post', methods=['POST'])
def posting():
    result = request.get_json()
    # print(result["comment"], result["weather"], result["date"])
    post = {
        "postId": random.random(),
        "email": result["email"],
        "img": result["img"],
        "date": result["date"],
        "weather": result["weather"],
        "comment": result["comment"],
    }

    db.users.insert_one(post)

    return jsonify({"result": "일기를 저장했습니다!"})

# 회원가입 API
@app.route('/api/usersignup/',methods = ['POST'])
def api_signuppage():
    nickname_receive = request.form['nickname_give']
    email_receive = request.form['email_give']
    pw_receive = request.form['pw_give']
    pw_check_receive = request.form['pw_check_give']
    # 비밀번호는 hashlib을 이용하여 해시함수로 변환하기
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    #db 저장하기
    doc = {
        'nick': nickname_receive,
        'pw': pw_hash,
        'email': email_receive,
        'pw_check': pw_check_receive
    }
    db.user.insert_one(doc)
    return jsonify({'msg': '회원가입을 축하드립니다!'})
#
# # 로그인 API
@app.route('/api/userlogin/', methods = ['POST'])
def api_loginpage():
    email_receive = request.form['email_give']
    pw_receive = request.form['pw_give']
    # 비밀번호는 hashlib을 이용하여 해시함수로 변환하기
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    # 저장되어있는 db와 확인하기
    doc = {
        'email': email_receive,
        'pw' : pw_hash
    }
    result = db.user.find_one(doc)

    if result is not None:
        payload = {
            'email': email_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1) #만료시간
        }
        token = jwt.encode(payload, SECRET_KEY , algorithm='HS256')#decode('utf-8')
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail', 'msg': '이메일/비밀번호가 일치하지 않습니다.'})


@app.route('/mypage/userinfo', methods=['GET'])
def userinfo_mypage():
    # email_receive = request.args.get('sample_give')
    user_info = db.users.find_one({'email': 'sample_give'}, {'_id': False})

    return jsonify({'msg': user_info})


@app.route('/mypage/delete', methods=['GET'])
def delete_mypage():
    postId_receive = request.args.get('postId_give')
    db.posts.delete_one({'postId': postId_receive})
    return jsonify({'msg': '삭제 완료!'})

@app.route('/mypage/showmypost', methods=['GET'])
def show_mypost():
    sample_receive = request.args.get('sample_give')
    my_posts = list(db.posts.find({'num': sample_receive}, {'_id': False}))
    print(my_posts)
    return jsonify({'my_posts': my_posts})


@app.route('/allpost', methods=['GET'])
def show_allpost():
    all_post = list(db.posts.find({}, {'_id': False}))
    return jsonify({'all_post': all_post})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)