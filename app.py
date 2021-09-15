from flask import Flask, render_template, request, redirect, url_for, jsonify
from pymongo import MongoClient
import random
import jwt
import hashlib
import datetime
import urllib.request

app = Flask(__name__)
SECRET_KEY = 'secret'
#app.secret_key = 'tmxmflddmfhdkanrjsk'
client = MongoClient('localhost', 27017)
db = client.To_Scribble

UPLOAD_FOLDER = 'static/uploads/'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def loginCheck():
    if request.cookies.get('mytoken') is not None:
        return True
    else:
        return False

# 페이지 연결기능 여기서 작성해주세요!
@app.route('/')
def mainpage():
    # token_receive = request.cookies.get('mytoken')
    # try:
    #     payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
    #     user_info = db.users.find_one({"email": payload['email']})
    #     all_post = list(db.posts.find({}, {'_id': False}))
    #     all_post.reverse()
    #     return render_template('mainpage.html',all_post=all_post, logincheck=loginCheck())
    # except jwt.exceptions.DecodeError:
    #     return redirect(url_for("loginpage", msg="로그인 정보가 존재하지 않습니다."))
    if request.cookies.get('mytoken') is not None:
        token_receive = request.cookies.get('mytoken')
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"email": payload['email']})
    else:
        user_info = {'nick' : 'guest'}
    all_post = list(db.posts.find({}, {'_id': False}))
    all_post.reverse()
    return render_template('mainpage.html', userinfo=user_info, all_post=all_post, logincheck=loginCheck())


@app.route('/userlogin/')
def loginpage():
    msg = request.args.get("msg")
    return render_template('login.html', msg = msg)

@app.route('/usersignup/')
def signuppage():
    return render_template('signup.html')

@app.route('/mypage/')
def mypage():
    # token_receive = request.cookies.get('mytoken')
    # payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
    # my_posts = list(db.posts.find({'email': payload["email"]}, {'_id': False}))
    # my_posts.reverse()
    # # return jsonify({'my_posts': my_posts})
    # return render_template('mypage.html',my_posts=my_posts)
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"email": payload['email']})
        my_posts = list(db.posts.find({'email': payload["email"]}, {'_id': False}))
        my_posts.reverse()
        return render_template('mypage.html',my_posts=my_posts, userinfo=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for('fail', msg="로그인 시간 만료"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("mainpage", msg="로그인 정보가 존재하지 않습니다."))

## 로그인 HTML을 주는 기능
# API 기능 여기서 작성해주세요!

# 일기 포스팅(등록) API
@app.route('/mainpage/post', methods=['POST'])
def posting():
    token_receive = request.cookies.get('mytoken')
    result = request.get_json()
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])

    imageurl = result["img"]
    postID = str(random.random())[3:]
    imagepath = f'../static/postimg/{postID}.jpg'
    urllib.request.urlretrieve(imageurl, f'static/postimg/{postID}.jpg') # static 내에 postimg 폴더 있어야할듯 이거 나중에처리해주자.
    ###img 저장 부분###
    post = {
        "postId": postID, # split 해서 2번째 자리부터 가져오기 나중에처리.
        "email": payload["email"],
        "img": imagepath,
        "date": result["date"],
        "weather": result["weather"],
        "comment": result["comment"],
    }
    db.posts.insert_one(post)
    return jsonify({"result": "일기를 저장했습니다!"})

# 회원가입 API
@app.route('/api/usersignup/',methods = ['POST'])
def api_signuppage():
    nickname_receive = request.form['nickname_give'] # request.form.get()을 사용하면 값이 None일 때도 출력할 수 있다.
    email_receive = request.form['email_give']
    pw_receive = request.form['pw_give']
    pw_check_receive = request.form['pw_check_give']
    # 비밀번호는 hashlib을 이용하여 해시함수로 변환하기
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    # 사진파일
    file = request.files["file_give"]
    extension = file.filename.split('.')[-1] # ex) jpg
    save_to = f'static/img/{email_receive}.{extension}'  #email이라는 이름은 img에 저장되는 이름일뿐
    file.save(save_to)
    img_url = f'../static/img/{email_receive}.{extension}'

    #db 저장하기
    doc = {
        'image': img_url,
        'nickname': nickname_receive,
        'pw': pw_hash,
        'email': email_receive,
        'pw_check': pw_check_receive
    }
    db.users.insert_one(doc)
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
    result = db.users.find_one(doc)

    if result is not None:
        payload = {
            'email': email_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=100) #만료시간
        }
        token = jwt.encode(payload, SECRET_KEY , algorithm='HS256')#decode('utf-8')
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail', 'msg': '이메일/비밀번호가 일치하지 않습니다.'})


@app.route('/mypage/userinfo', methods=['GET'])
def userinfo_mypage():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"email": payload['email']})

        return render_template('mypage.html', userinfo=user_info)

    except jwt.exceptions.DecodeError:
        return redirect(url_for("mainpage", msg="로그인 정보가 존재하지 않습니다."))


#    return jsonify({'msg': user_info})



@app.route('/mypage/delete', methods=['POST'])
def delete_mypage():
    postId_receive = request.form['postId_give']
    db.posts.delete_one({'postId': postId_receive})
    return jsonify({'msg': '삭제 완료!'})



#@app.route('/mypage/showmypost', methods=['GET'])
# def show_mypost():
#     sample_receive = request.args.get('sample_give')
#     my_posts = list(db.posts.find({'num': sample_receive}, {'_id': False}))
#     print(my_posts)
#     return jsonify({'my_posts': my_posts})


# @app.route('/allpost', methods=['GET'])
# def show_allpost():
#     all_post = list(db.posts.find({}, {'_id': False}))
#     return jsonify({'all_post': all_post})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)