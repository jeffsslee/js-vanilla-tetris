import BLOCKS from './blocks.js';

// Variables
const GAME_LOWS = 20;
const GAME_COLS = 11;
let score;
let duration;
const dropDuration = 10;
let downInterval;
let speedUpInterval;
const speedUpDuratiion = 1000 * 60;
let speed;
let movingItem;
const item = {
  type: '',
  direction: 0,
  top: 0,
  left: 4,
};

// DOM
const playgroundul = document.querySelector('.playground > ul');
const gameIntroDiv = document.querySelector('.game-intro');
const gamePauseDiv = document.querySelector('.game-pause');
const gameEndDiv = document.querySelector('.game-end');
const startButton = document.querySelector('.game-intro > button');
const releasePauseButton = document.querySelector('.game-pause > button');
const retryButton = document.querySelector('.game-end > button');
const scoreSpan = document.querySelector('#score');
const speedSpan = document.querySelector('#speed');

// basic control : start, pause, end-game

gameIntroDiv.style.display = 'flex';

startButton.addEventListener('click', () => {
  init();
  gameIntroDiv.style.display = 'none';
});

releasePauseButton.addEventListener('click', () => {
  gamePauseDiv.style.display = 'none';
  document.addEventListener('keydown', keyControl);
  downInterval = setInterval(() => {
    moveBlock('top', 1);
  }, duration);
});

retryButton.addEventListener('click', () => {
  init();
  gameEndDiv.style.display = 'none';
});

// function
function init() {
  score = 0;
  duration = 500;
  speed = 1;

  playgroundul.innerHTML = '';
  scoreSpan.textContent = score;
  speedSpan.textContent = speed;

  // to prepare playground cells
  for (let i = 0; i < GAME_LOWS; i++) {
    generateNewLine();
  }

  createNewBlock();

  document.addEventListener('keydown', keyControl);

  clearInterval(speedUpInterval);
  speedUpInterval = setInterval(() => {
    speedUp();
  }, speedUpDuratiion);
}

function speedUp() {
  if (speed < 7) {
    speed += 1;
    speedSpan.textContent = speed;
    duration -= 40;
    clearInterval(downInterval);
    downInterval = setInterval(() => {
      moveBlock('top', 1);
    }, duration);
  }
}

function createNewBlock() {
  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);
  item.type = blockArray[randomIndex][0];
  item.direction = 0;
  item.top = 0;
  item.left = 4;
  movingItem = { ...item };
  renderBlock();

  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1);
  }, duration);
}

function generateNewLine() {
  let li = document.createElement('li');
  let ul = document.createElement('ul');
  for (let j = 0; j < GAME_COLS; j++) {
    const cell = document.createElement('li');
    ul.prepend(cell);
  }
  li.prepend(ul);
  playgroundul.prepend(li);
}

function renderBlock(movetype = '') {
  const { type, direction, top, left } = movingItem;

  let previousCells = document.querySelectorAll('.moving');
  previousCells.forEach((preCell) => {
    preCell.classList.remove(type, 'moving');
  });

  BLOCKS[type][direction].some((block) => {
    let x = block[0] + left;
    let y = block[1] + top;
    // playgroundul = ul
    // check undefined
    let target = playgroundul.childNodes[y] ? playgroundul.childNodes[y].childNodes[0].childNodes[x] : null;
    if (isWithinGround(target)) {
      target.classList.add(type, 'moving');
    } else {
      // if out of boundary
      // get previous render success position
      movingItem = { ...item };
      if (movetype === 'retry') endGame();
      setTimeout(() => {
        renderBlock('retry');
        if (movetype === 'top') seizeBlock();
      }, 0);
      return true;
    }
  });
  // if current render is success, store the pos info to 'item' object
  item.left = left;
  item.top = top;
  item.direction = direction;
  item.type = type;
}

function endGame() {
  clearInterval(downInterval);
  document.removeEventListener('keydown', keyControl);
  gameEndDiv.style.display = 'flex';
}

function seizeBlock() {
  const currentBlockCells = document.querySelectorAll('.moving');
  currentBlockCells.forEach((cell) => {
    cell.classList.remove(item.type, 'moving');
    cell.classList.add('seized');
  });
  checkLineFullySeized();
}

function checkLineFullySeized() {
  const line = playgroundul.childNodes;
  line.forEach((ul) => {
    let fullySeized = true;
    ul.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains('seized')) fullySeized = false;
    });

    if (fullySeized) {
      score += 10;
      scoreSpan.textContent = score;
      ul.remove();
      generateNewLine();
    }
  });
  createNewBlock();
}

function keyControl(e) {
  // console.log(e.key);
  switch (e.key) {
    case 'ArrowLeft':
      moveBlock('left', -1);
      break;
    case 'ArrowRight':
      moveBlock('left', 1);
      break;
    case 'ArrowUp':
      changeDirection();
      break;
    case 'ArrowDown':
      moveBlock('top', 1);
      break;
    case ' ':
      dropBlock();
      break;
    case 'Escape':
      pauseGame();
      break;
    default:
      break;
  }
}
function pauseGame() {
  clearInterval(downInterval);
  document.removeEventListener('keydown', keyControl);
  gamePauseDiv.style.display = 'flex';
}
function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1);
  }, dropDuration);
}
function moveBlock(moveType, amount) {
  movingItem[moveType] += amount;
  renderBlock(moveType);
}
function isWithinGround(target) {
  let withinGround = true;
  // if target is falsy : false, 0, -0, NaN, '', undefined, null
  if (!target || target.classList.contains('seized')) withinGround = false;
  return withinGround;
}
function changeDirection() {
  movingItem.direction += 1;
  movingItem.direction === 4 ? (movingItem.direction = 0) : movingItem.direction;
  renderBlock();
}
