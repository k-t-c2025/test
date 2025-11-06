function getRandomImage() {
    const number = Math.floor(Math.random() * 7);
    const imagePath = `./images/omikuji-${number.toString()}.png`;
    return imagePath;
}

function playOmikuji() {
    const timer = setInterval(function(){
        document.querySelector("#js-result").setAttribute("src", getRandomImage());
    }, 100);
    
    setTimeout(function(){
        clearInterval(timer);
    }, 3000);
}

document.querySelector("#js-button").addEventListener("click", playOmikuji);