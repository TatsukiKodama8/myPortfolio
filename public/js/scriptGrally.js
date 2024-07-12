// いずれデータベースから取ってくるべきもの
const imgArray = [
    'img/img_forest.jpg',
    'img/img_mountains.jpg',
    'img/img_snow.jpg',
    'img/lights.jpg',
];

let counter = 0;    // initialize
let sec = 1000;
let interval = 10 * sec;
let intervalId; // To store the interval ID

const change2NextImg = () => {
    let aryNum = imgArray.length;
    counter = (counter < (aryNum - 1)) ? ++counter : 0; // counter++ だと動かない
    document.getElementById("pics").src = imgArray[counter];
};

const startSlideShow = () => {
    let img = document.getElementById('pics');
    img.src = imgArray[counter];
    intervalId = setInterval(change2NextImg, interval);
};

// ラジオボタンがチェックしているvalueを返す
// TODO: for文使わなくてもできるでしょ、これ
const obtainRadioElement = (name) => {
    let elems = document.getElementsByName(name);
    for (let i = 0; i < elems.length; i++) {
        if (elems[i].checked) {
            console.log("obtainRadioElement", elems[i].value);
            return elems[i].value;
        }
    }
}

const slideShow = () => {
    console.log("changed!");
    let intervalTime = parseFloat(obtainRadioElement('secRadio')) * sec; // Multiply by 1000 to get milliseconds
    console.log(typeof intervalTime);
    console.log(intervalTime, "msec");

    // インターバルをリセット
    clearInterval(intervalId);

    // 新しくインターバルを割り当てる
    intervalId = setInterval(change2NextImg, intervalTime);
}

window.onload = () => {
    startSlideShow();
};