// Simon Game

/*----- constants -----*/
const SPACES = {
  tl: {
    num: 1,
    offColor: "rgba(255, 255, 0, 0.2)",
    onColor: "rgba(255, 255, 0, 1)",
    freq: 277.2, // C#,
  },
  tr: {
    num: 2,
    offColor: "rgba(0, 0, 255, 0.5)",
    onColor: "rgba(0, 0, 255, 1)",
    freq: 392.0, // G;
  },
  bl: {
    num: 3,
    offColor: "rgba(255, 0, 0, 0.5)",
    onColor: "rgba(255, 0, 0, 1)",
    freq: 329.6, // E;
  },
  br: {
    num: 4,
    offColor: "rgba(0, 128, 0, 0.5)",
    onColor: "rgba(0, 128, 0, 1)",
    freq: 784.0, // G (up octive);
  },
};
const TIME_BETWEEN_SPACES = 1000; // in ms
const TIME_BETWEEN_SEQ = 400;
const TIME_TO_PLAY_TONE = 800; // in ms

/*----- state variables -----*/
const simonSequence = [];
const playerSequence = [];
var playingSeq = null; // Is Simon currently playing a sequence?
var enableClick = null;
renderTimeout = null;
var clearRender = {
  spaceEl: null,
  color: null,
};

/*----- cached elements  -----*/
const board = document.getElementById("board");
const startBtn = document.getElementById("game-start-btn");
const score = document.getElementById("game-score-val");
const highScore = document.getElementById("game-high-score-val");
const statusMsg = document.getElementById("game-message");

/*-- The audio cached elements --*/
var ctx = null;
var osc = null;

/*----- event listeners -----*/
board.addEventListener("click", onClickSpace); // delegated to each space
startBtn.addEventListener("click", onClickStart);

/*----- functions -----*/
init();

function init() {
  console.log("Initializing");
  simonSequence.length = 0;
  playerSequence.length = 0;
  startBtn.disabled = false;
  playingSeq = false;
  enableClick = false;
  curIdx = null;
  statusMsg.innerText = "Welcome";
}

// plays one element of the sequence, then recursively calls
// itself to play the next element in the sequence.
function playSequence(idxToPlay) {
  if (idxToPlay === simonSequence.length) {
    playingSeq = false;
    statusMsg.innerText = "Your Turn";
    enableClick = true;
    return;
  }
  for (let space in SPACES) {
    if (SPACES[space].num === simonSequence[idxToPlay]) {
      playingSeq = true;
      const el = document.getElementById(space);
      renderSpace(el);
    }
  }
  setTimeout(() => {
    playSequence(++idxToPlay);
  }, TIME_BETWEEN_SPACES);
}

function renderSpace(el) {
  if (renderTimeout) {
    console.log("already lit");
    clearTimeout(renderTimeout);
    clearRender.spaceEl.style.backgroundColor = clearRender.color;
  }
  var space = el.getAttribute("id");
  el.style.backgroundColor = SPACES[space].onColor;
  clearRender.spaceEl = el;
  clearRender.color = SPACES[space].offColor;
  playTone(SPACES[space].freq);
  renderTimeout = setTimeout(() => {
    clearRender.spaceEl.style.backgroundColor = clearRender.color;
    renderTimeout = null;
  }, TIME_TO_PLAY_TONE);
}

function onClickSpace(evt) {
  if (!enableClick) return;
  const space = evt.target.getAttribute("id");
  playerSequence.push(SPACES[space].num);
  renderSpace(evt.target);
  checkCorrect();
}

function onClickStart(evt) {
  score.innerText = 0;
  setTimeout(() => {
    startSimonSequence();
  }, TIME_BETWEEN_SEQ);
}

function startSimonSequence() {
  startBtn.disabled = true;
  statusMsg.innerText = "My Turn";
  enableClick = false;
  simonSequence.push(generateRandonSpace());
  playSequence(0);
}

function generateRandonSpace() {
  const spaceNum = Math.floor(Math.random() * 4) + 1;
  return spaceNum;
}

function checkCorrect() {
  const arr1 = playerSequence;
  const arr2 = simonSequence.slice(0, playerSequence.length);
  if (arr1.every((value, index) => value === arr2[index])) {
    if (playerSequence.length === simonSequence.length) {
      score.innerText = playerSequence.length;
      if (playerSequence.length > parseInt(highScore.innerText)) {
        highScore.innerText = playerSequence.length;
      }
      enableClick = false;
      playerSequence.length = 0;
      setTimeout(() => {
        statusMsg.innerText = "My Turn";
        startSimonSequence();
      }, TIME_BETWEEN_SPACES + TIME_BETWEEN_SEQ);
    }
  } else {
    init();
    statusMsg.innerText = "Game Over";
    playTone(0);
    startBtn.disabled = false;
  }
}

function playTone(hertz) {
  if (!ctx) ctx = new AudioContext();
  if (osc) {
    osc.stop();
  }
  osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.value = hertz ? hertz : 80; // value in hertz
  osc.start();
  osc.stop(ctx.currentTime + TIME_TO_PLAY_TONE / 1000);
}
