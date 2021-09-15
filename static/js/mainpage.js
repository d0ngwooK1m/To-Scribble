$(document).ready(function () {
                showAllpost();
            });
let checkOpened = false;
const popupBtn = document.querySelector('.drawing-hide-button');
const testBox = document.querySelector('.diary');

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

                            for (let i = 0; i < posts.length; i++) {
                                let imageurl = posts[i]['image']
                                let text = posts[i]['text']
                                let date = posts[i]['date']
                                let weather = posts[i]['weather']

                                let temp_html = `
                            <div class="card">
                                <div class="card-image">
                                    <figure class="image is-4by3">
                                        <img src=${imageurl} >
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