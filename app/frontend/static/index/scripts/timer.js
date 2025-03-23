const button = document.querySelector('.header__button');

button.addEventListener('click', () => {
console.log('Hello');
    });

    

function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();


    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const currentTime = `${hours}:${minutes}`;

    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = currentTime;
    }
}

setInterval(updateTime, 60000);

updateTime();