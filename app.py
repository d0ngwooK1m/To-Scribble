from flask import Flask, render_template, request, redirect, url_for, jsonify
from pymongo import MongoClient
import random
import jwt
import hashlib
import datetime
import urllib.request
import platform
import os

app = Flask(__name__)
SECRET_KEY = 'secret'
oss = platform.system()
server = 'mongodb://test:test@localhost'
local = 'localhost'
if oss is 'Windows':
    print("Local")
    client = MongoClient(local, 27017)
else:
    print("Server")
    client = MongoClient(server, 27017)

db = client.To_Scribble

def loginCheck():
    if request.cookies.get('mytoken') is not None:
        return True
    else:
        return False
@app.route('/')
def mainpage():
    all_post = list(db.posts.find({}, {'_id': False}))
    for post in all_post:
        post['count'] = db.likes.count_documents({"post_id": post["postId"]})
    if request.cookies.get('mytoken') is not None:
        token_receive = request.cookies.get('mytoken')
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"email": payload['email']})
        for post in all_post:
            post['checklike'] =  bool(db.likes.find_one({"post_id": post["postId"], "useremail": payload['email']}))
    else:
        user_info = {'nickname' : 'guest'}
    all_post.reverse()
    print(all_post)
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
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"email": payload['email']})
        my_posts = list(db.posts.find({'email': payload["email"]}, {'_id': False}))
        my_posts.reverse()
        solve = db.solves.count_documents({"useremail": payload['email']})
        for post in my_posts:
            post['count'] = db.likes.count_documents({"post_id": post["postId"]})
        return render_template('mypage.html',my_posts=my_posts, userinfo=user_info,solve = str(solve))
    except jwt.ExpiredSignatureError:
        return redirect(url_for('fail', msg="로그인 시간 만료"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("mainpage", msg="로그인 정보가 존재하지 않습니다."))

@app.route('/mainpage/post', methods=['POST'])
def posting():
    token_receive = request.cookies.get('mytoken')
    result = request.get_json()
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])

    imageurl = result["img"]
    postID = str(random.random())[3:10]
    if postID[0] == '0':
        postID = postID[1:]
    imagepath = f'../static/postimg/{postID}.jpg'
    urllib.request.urlretrieve(imageurl, f'static/postimg/{postID}.jpg')
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
    duplication_check = db.users.find_one({"email": email_receive}) # 이메일 중복확인
    if duplication_check is not None:
        return jsonify({"msg": "이메일이나 비밀번호가 잘못되었습니다. 다시 확인해주세요!"}), 400
    pw_receive = request.form['pw_give']
    # 비밀번호는 hashlib을 이용하여 해시함수로 변환하기
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    # 사진파일
    if len(request.files): # 보내준 파일이 있다면 여기를
        file = request.files["file_give"]
        extension = file.filename.split('.')[-1] # ex) jpg
        save_to = f'static/img/{email_receive}.{extension}'
        file.save(save_to)
        img_url = f'../static/img/{email_receive}.{extension}'
    else: # 보내준 파일이 없다면 여기를.
        img_url = f'../static/img/pepewine.png'

    #db 저장하기
    doc = {
        'image': img_url,
        'nickname': nickname_receive,
        'pw': pw_hash,
        'email': email_receive,
       # 'pw_check': pw_check_receive
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
        if oss is 'Windows':
            token = jwt.encode(payload, SECRET_KEY , algorithm='HS256')#decode('utf-8')
        else:
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')
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

@app.route('/mypage/delete', methods=['POST'])
def delete_mypage():
    postId_receive = request.form['postId_give']
    imgpath = db.posts.find_one({'postId': postId_receive})['img'][3:] #포스트 이미지 경로
    if os.path.isfile(imgpath): # 삭제
        os.remove(imgpath)
    db.posts.delete_one({'postId': postId_receive})
    print(db.likes.remove({'post_id':postId_receive}))
    return jsonify({'msg': '삭제 완료!'})

@app.route('/update_like', methods=['POST'])
def update_like():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        #payload['email']}
        post_id_receive = request.form["post_id_give"]
        action = request.form["action_give"] # "like" or "inlike" 좋아요 or 취소
        doc = {
            "post_id": post_id_receive,
            "useremail": payload['email'],
        }
        if action == "like": # 좋아요면 db에 데이터 추가
            db.likes.insert_one(doc)
        else: # 싫어요면 db에서 삭제
            db.likes.delete_one(doc)
        count = db.likes.count_documents({"post_id": post_id_receive}) # 좋아요 개수 가져와서
                                                                       # html에 뿌려준다.
        return jsonify({"result": "success", 'msg': 'updated', "count": str(count)})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("mainpage"))

### 퀴즈 얻어오기 ###
@app.route('/getquiz', methods=['GET'])
def get_quiz(): #userinfo_mypage()
    token_receive = request.cookies.get('mytoken')
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
    posts = list(db.posts.find({}, {'_id': False}))
    ret = []
    for post in posts:
        if (post['email'] != payload['email']) and (bool(db.solves.find_one({"post_id": post["postId"], "useremail": payload['email']})) == False):
            dic = {
                'postId' :  post["postId"],
                'weather' : post["weather"],
                'img' : post['img'],
            }
            ret.append(dic)
    for i in ret:
        print(i)
    if len(ret) == 0:
        return jsonify({'msg': "AllSolve"})
    else:
        return jsonify({'msg' : "GET",'quiz': ret[random.randrange(0, len(ret))]})
    # 모든 포스트를 리스트로 불러오기
    # 리스트를 돌면서 포스트ID와 현재 접속한 userID 를 비교해가면서.
    # 자신이 작성하거나, 이미 맞춘 포스트를 제외하고 ret에 img,postID,weather 만 저장한다.
    # 그후에 ret이 0 이면 현재올라와있는 post는 모두 맞춘거니까 아무것도반환하지 않는다.
    # 0이 아니라면 그 리스트중 랜덤으로 하나 뽑아서 반환해준다.

@app.route('/solve', methods=['POST'])
def Solve(): #이함수를 들어왔다는거 자체가 solve라고 생각하고 코드함. 마췃는지 틀렷는지 판별은 JS 에서..
    token_receive = request.cookies.get('mytoken')
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
    post_id_receive = request.form["post_id_give"]
    doc = {
        "post_id": post_id_receive,
        "useremail": payload['email'],
    }
    db.solves.insert_one(doc) # 맞으면 추가.
    return jsonify({"result": "success"})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)