let sequence = [];     
let playerStep = 0;     
let isShowing = false;  
let gameActive = false; 
let showTimer = null;   

let buttons = document.querySelectorAll('.pad');

let audioContext = null;
let frequencies = [329, 262, 220, 164];

function playSound(index) {
    if (audioContext === null) {
        return; 
    }
    let oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequencies[index];
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
}

function flashButton(index) {
    playSound(index);
    buttons[index].classList.add('active');
    setTimeout(function () {
        buttons[index].classList.remove('active');
    }, 500);
}

function showSequence(i) {
    if (i === sequence.length) {
        isShowing = false; 
        playerStep = 0;
        document.getElementById('message').textContent = 'Ваш ход: повторите последовательность.';
        return;
    }
    flashButton(sequence[i]);
    showTimer = setTimeout(function () {
        showSequence(i + 1);
    }, 700); // пауза между подсветками
}

function nextRound() {
    sequence.push(Math.floor(Math.random() * 4));
    document.getElementById('level').textContent = sequence.length;
    document.getElementById('message').textContent = 'Смотрите последовательность.';
    isShowing = true;
    showTimer = setTimeout(function () {
        showSequence(0);
    }, 800); 
}

function onPadClick(index) {
    if (!gameActive || isShowing) {
        return; 
    }
    flashButton(index);
    if (index === sequence[playerStep]) {
        playerStep = playerStep + 1;
        if (playerStep === sequence.length) {
            nextRound(); 
        }
    } else {
        gameActive = false; 
        let message = document.getElementById('message');
        message.textContent = 'Вы проиграли, комбинация неверна. Вы дошли до уровня ' + sequence.length;
        message.classList.add('error'); 
    }
}

function startGame() {
    clearTimeout(showTimer); 
    if (audioContext === null) {
        try {
            audioContext = new AudioContext(); 
        } catch (e) {
            audioContext = null;
        }
    }
    sequence = [];
    playerStep = 0;
    gameActive = true;
    document.getElementById('message').classList.remove('error');
    nextRound();
}

document.getElementById('startBtn').onclick = startGame;
for (let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function () {
        onPadClick(i);
    };
}