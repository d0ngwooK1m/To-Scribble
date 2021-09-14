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