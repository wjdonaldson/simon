// Simon Game

/*----- constants -----*/
const SPACES = {
  tl: {
    num: 1,
    offColor: "rgba(255, 255, 0, 0.5)",
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
const TIME_BETWEEN_SEQ = 1000;
const TIME_TO_PLAY_TONE = 500; // in ms
const TIME_RAMP_DOWN = 0.1; // in seconds
const WAIT_FOR_RAMP_DOWN = 110; // in ms

/*----- state variables -----*/
const simonSequence = [];
const playerSequence = [];
var playingSeq = null; // Is Simon currently playing a sequence?

/*----- cached elements  -----*/
const board = document.getElementById("board");
const startBtn = document.getElementById("game-start-btn");
const seqLen = document.getElementById("game-seq-len-val");
const seqLeft = document.getElementById("game-seq-left-val");
const statusMsg = document.getElementById("game-message");

/*-- The audio cached elements --*/
const ctx = new AudioContext();
var osc = null;
var gain = null;
var playingTone = false; // Is a tone currently playing?

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
  playingTone = false;
  statusMsg.innerText = "";
}

// plays one element of the sequence, then recursively calls
// itself to play the next element in the sequence.
function playSequence(idxToPlay) {
  if (idxToPlay === 0) {
    seqLen.innerText = simonSequence.length;
  }
  seqLeft.innerText = simonSequence.length - idxToPlay;
  console.log(`playSequence(${idxToPlay})`);
  if (idxToPlay === simonSequence.length) {
    playingSeq = false;
    statusMsg.innerText = "Your Turn";
    console.log("Done playing sequence");
    return;
  }
  for (let space in SPACES) {
    if (SPACES[space].num === simonSequence[idxToPlay]) {
      // console.log(`iterate, ${simonSequence[idxToPlay]}`);
      playingSeq = true;
      const el = document.getElementById(space);
      renderSpace(el);
    }
  }
  setTimeout(function () {
    playSequence(idxToPlay + 1);
  }, TIME_BETWEEN_SPACES);
}

function renderSpace(el) {
  // console.log("renderSpace");
  const space = el.getAttribute("id");
  el.style.backgroundColor = SPACES[space].onColor;
  playTone(SPACES[space].freq);
  setTimeout(function () {
    el.style.backgroundColor = SPACES[space].offColor;
  }, TIME_TO_PLAY_TONE);
}

function onClickSpace(evt) {
  if (playingSeq || playingTone) return;
  renderSpace(evt.target);
  const space = evt.target.getAttribute("id");
  playerSequence.push(SPACES[space].num);
  checkCorrect();
}

function onClickStart(evt) {
  startSimonSequence();
}

function startSimonSequence() {
  startBtn.disabled = true;
  startBtn.style.visibility = "hidden";
  statusMsg.innerText = "My Turn";
  simonSequence.push(generateRandonSpace());
  playSequence(0);
}

function startPlayerSequence() {
  playerSequence.length = 0;
  // TODO: enable space clicks?
}

function generateRandonSpace() {
  const spaceNum = Math.floor(Math.random() * 4) + 1;
  console.log(`random space: ${spaceNum}`);
  return spaceNum;
}

function checkCorrect() {
  const arr1 = playerSequence;
  const arr2 = simonSequence.slice(0, playerSequence.length);
  if (arr1.every((value, index) => value === arr2[index])) {
    if (playerSequence.length === simonSequence.length) {
      playerSequence.length = 0;
      setTimeout(function () {
        startSimonSequence();
      }, TIME_BETWEEN_SPACES + TIME_BETWEEN_SEQ);
    }
  } else {
    init();
    statusMsg.innerText = "Game Over";
    startBtn.innerText = "Start Over";
    startBtn.disabled = false;
    startBtn.style.visibility = "visible";
  }
}

function playTone(hertz) {
  if (playingTone) {
    console.log("already playing tone!");
    // TODO: if already playing, stop the current tone
    // before playing the new one - NOT WORKING!
    // gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.001);
    // playingTone = false;
    return;
  }
  osc = ctx.createOscillator();
  gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = hertz; // value in hertz
  playingTone = true;
  osc.start();
  setTimeout(function () {
    // console.log("callback");
    gain.gain.exponentialRampToValueAtTime(
      0.00001,
      ctx.currentTime + TIME_RAMP_DOWN
    );
    setTimeout(function () {
      playingTone = false;
    }, WAIT_FOR_RAMP_DOWN);
  }, TIME_TO_PLAY_TONE);
}
