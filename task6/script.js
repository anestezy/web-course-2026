(function () {
  "use strict";

  var CANVAS_SIZE = 400;
  var CELL_SIZE = 20;
  var GRID_COUNT = CANVAS_SIZE / CELL_SIZE;
  var MOVE_INTERVAL = 150;

  var Model = (function () {
    var state = {};

    function init() {
      state.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      state.direction = { x: 1, y: 0 };
      state.nextDirection = { x: 1, y: 0 };
      state.score = 0;
      state.gameOver = false;
      state.apple = null;
      spawnApple();
    }

    function getState() {
      return state;
    }

    function spawnApple() {
      var freeCells = [];
      var i, j, k, isOccupied;

      for (i = 0; i < GRID_COUNT; i++) {
        for (j = 0; j < GRID_COUNT; j++) {
          isOccupied = false;
          for (k = 0; k < state.snake.length; k++) {
            if (state.snake[k].x === i && state.snake[k].y === j) {
              isOccupied = true;
              break;
            }
          }
          if (!isOccupied) {
            freeCells.push({ x: i, y: j });
          }
        }
      }

      if (freeCells.length > 0) {
        var randomIndex = Math.floor(Math.random() * freeCells.length);
        state.apple = freeCells[randomIndex];
      }
    }

    function checkCollision() {
      var head = state.snake[0];
      var i;

      if (
        head.x < 0 ||
        head.x >= GRID_COUNT ||
        head.y < 0 ||
        head.y >= GRID_COUNT
      ) {
        return true;
      }

      for (i = 1; i < state.snake.length; i++) {
        if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
          return true;
        }
      }

      return false;
    }

    function moveSnake() {
      state.direction = { x: state.nextDirection.x, y: state.nextDirection.y };

      var head = state.snake[0];
      var newHead = {
        x: head.x + state.direction.x,
        y: head.y + state.direction.y,
      };

      state.snake.unshift(newHead);

      if (newHead.x === state.apple.x && newHead.y === state.apple.y) {
        state.score++;
        spawnApple();
      } else {
        state.snake.pop();
      }

      if (checkCollision()) {
        state.gameOver = true;
      }
    }

    function setDirection(newDir) {
      if (newDir.x === -state.direction.x && newDir.y === -state.direction.y) {
        return;
      }
      state.nextDirection = { x: newDir.x, y: newDir.y };
    }

    return {
      init: init,
      getState: getState,
      moveSnake: moveSnake,
      setDirection: setDirection,
    };
  })();

  var View = (function () {
    var canvas,
      ctx,
      scoreElement,
      gameOverElement,
      finalScoreElement,
      startScreen;

    function init() {
      canvas = document.getElementById("game-canvas");
      ctx = canvas.getContext("2d");
      scoreElement = document.getElementById("score");
      gameOverElement = document.getElementById("game-over");
      finalScoreElement = document.getElementById("final-score");
      startScreen = document.getElementById("start-screen");
    }

    function draw() {
      var state = Model.getState();

      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      drawGrid();

      if (state.apple) {
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(
          state.apple.x * CELL_SIZE,
          state.apple.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE,
        );
      }

      var i;
      for (i = 0; i < state.snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#2ecc71" : "#27ae60";
        ctx.fillRect(
          state.snake[i].x * CELL_SIZE,
          state.snake[i].y * CELL_SIZE,
          CELL_SIZE - 1,
          CELL_SIZE - 1,
        );
      }

      scoreElement.textContent = state.score;

      if (state.gameOver) {
        finalScoreElement.textContent = state.score;
        gameOverElement.classList.remove("hidden");
      }
    }

    function drawGrid() {
      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 0.5;

      var i;
      for (i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }
    }

    function hideGameOver() {
      gameOverElement.classList.add("hidden");
    }

    function hideStartScreen() {
      startScreen.classList.add("hidden");
    }

    function showStartScreen() {
      startScreen.classList.remove("hidden");
    }

    return {
      init: init,
      draw: draw,
      hideGameOver: hideGameOver,
      hideStartScreen: hideStartScreen,
      showStartScreen: showStartScreen,
    };
  })();

  var Controller = (function () {
    var lastMoveTime = 0;
    var running = false;
    var animFrameId = null;

    function init() {
      View.init();
      Model.init();

      document.addEventListener("keydown", handleKeyDown);
      document.getElementById("restart-btn").addEventListener("click", restart);
      document.getElementById("start-btn").addEventListener("click", startGame);
    }

    function startGame() {
      Model.init();
      View.hideStartScreen();
      View.hideGameOver();
      running = true;
      lastMoveTime = performance.now();
      animFrameId = requestAnimationFrame(gameLoop);
    }

    function handleKeyDown(event) {
      var state = Model.getState();

      if (state.gameOver || !running) {
        return;
      }

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          Model.setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          event.preventDefault();
          Model.setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          event.preventDefault();
          Model.setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          event.preventDefault();
          Model.setDirection({ x: 1, y: 0 });
          break;
      }
    }

    function gameLoop(currentTime) {
      var state = Model.getState();

      if (state.gameOver) {
        running = false;
        View.draw();
        return;
      }

      var deltaTime = currentTime - lastMoveTime;

      if (deltaTime >= MOVE_INTERVAL) {
        Model.moveSnake();
        lastMoveTime = currentTime;
      }

      View.draw();
      animFrameId = requestAnimationFrame(gameLoop);
    }

    function restart() {
      Model.init();
      View.hideGameOver();
      running = true;
      lastMoveTime = performance.now();
      animFrameId = requestAnimationFrame(gameLoop);
    }

    return {
      init: init,
    };
  })();

  Controller.init();
})();
