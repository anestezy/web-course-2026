let secret = "";
let attempts = [];
let gameOver = false;

function generateSecret() {
  let digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let result = "";
  for (let i = 0; i < 4; i++) {
    let index = Math.floor(Math.random() * digits.length);
    result = result + digits[index];
    digits.splice(index, 1);
  }
  return result;
}

function validateInput(value) {
  if (value.length !== 4) {
    return "Нужно ввести ровно 4 цифры";
  }
  for (let i = 0; i < 4; i++) {
    if (value[i] < "0" || value[i] > "9") {
      return "Можно вводить только цифры, без букв и символов";
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (value[i] === value[j]) {
        return "Все цифры должны быть разными";
      }
    }
  }
  return "";
}

function countBullsAndCows(guess, secretNumber) {
  let bulls = 0;
  let cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secretNumber[i]) {
      bulls = bulls + 1;
    } else if (secretNumber.indexOf(guess[i]) !== -1) {
      cows = cows + 1;
    }
  }
  return { bulls: bulls, cows: cows };
}

function plural(n, one, two, five) {
  let d10 = n % 10;
  let d100 = n % 100;
  if (d10 === 1 && d100 !== 11) {
    return one;
  }
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) {
    return two;
  }
  return five;
}

function renderHistory() {
  let list = document.getElementById("history");
  list.innerHTML = "";
  for (let i = 0; i < attempts.length; i++) {
    let a = attempts[i];
    let li = document.createElement("li");
    li.textContent =
      a.guess +
      " → " +
      a.bulls +
      " " +
      plural(a.bulls, "бык", "быка", "быков") +
      ", " +
      a.cows +
      " " +
      plural(a.cows, "корова", "коровы", "коров");
    list.appendChild(li);
  }
}

function onCheckClick() {
  if (gameOver) {
    return;
  }
  let input = document.getElementById("guessInput");
  let message = document.getElementById("message");

  let error = validateInput(input.value);
  if (error !== "") {
    message.textContent = error;
    return;
  }

  let guess = input.value;
  let result = countBullsAndCows(guess, secret);
  attempts.push({ guess: guess, bulls: result.bulls, cows: result.cows });
  renderHistory();
  document.getElementById("counter").textContent = attempts.length;

  if (result.bulls === 4) {
    gameOver = true;
    message.textContent =
      "Победа! Угадано за " +
      attempts.length +
      " " +
      plural(attempts.length, "попытку", "попытки", "попыток");
    input.disabled = true;
  } else {
    message.textContent = "Быков: " + result.bulls + ", коров: " + result.cows;
  }

  input.value = "";
  input.focus();
}

function onInputKeydown(event) {
  if (event.key === "Enter") {
    onCheckClick();
  }
}

function onNewGameClick() {
  secret = generateSecret();
  attempts = [];
  gameOver = false;

  let input = document.getElementById("guessInput");
  input.disabled = false;
  input.value = "";
  document.getElementById("counter").textContent = 0;
  document.getElementById("message").textContent =
    "Компьютер загадал число из 4 разных цифр. Введите своё предположение.";
  renderHistory();
}

onNewGameClick();
document.getElementById("checkBtn").onclick = onCheckClick;
document.getElementById("newGameBtn").onclick = onNewGameClick;
document.getElementById("guessInput").onkeydown = onInputKeydown;
