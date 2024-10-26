const startEle = document.querySelector(".Start");
const stopEle = document.querySelector(".Stop");
const resetEle = document.querySelector(".Reset");

let [seconds, minutes, hours] = [0, 0, 0];
let timer = null;

const displayTime = document.getElementById("time");

function updateDisplay() {
    displayTime.innerHTML = `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
}

function updateTime() {
    seconds++;
    if (seconds == 60) {
        seconds = 0;
        minutes++;
        if (minutes == 60) {
            minutes = 0;
            hours++;
        }
    }
    updateDisplay();
}

startEle.addEventListener("click", () => {
    if (timer !== null) {
        clearInterval(timer);
    }
    timer = setInterval(updateTime, 1000);
});

stopEle.addEventListener("click", () => {
    clearInterval(timer);
});

resetEle.addEventListener("click", () => {
    clearInterval(timer);
    [seconds, minutes, hours] = [0, 0, 0];
    updateDisplay();
});

updateDisplay(); // Initial display