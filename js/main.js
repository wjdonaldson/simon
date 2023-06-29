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
const TIME_TO_PLAY_TONE = 800; // in ms
const TIME_RAMP_DOWN = 0.001; // in seconds
const WAIT_FOR_RAMP_DOWN = 2; // in ms

/*----- state variables -----*/
const simonSequence = [];
const playerSequence = [];
var playingSeq = null; // Is Simon currently playing a sequence?

/*----- cached elements  -----*/
const board = document.getElementById("board");
const startBtn = document.getElementById("game-start-btn");
const score = document.getElementById("game-score-val");
const statusMsg = document.getElementById("game-message");

/*-- The audio cached elements --*/
// const ctx = new AudioContext();
var ctx = null;
var osc = null;
// var gain = null;
// var soundInitialized = false;
//var playingTone = false; // Is a tone currently playing?

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
  statusMsg.innerText = "Welcome";
  score.innerText = 0;
}

// plays one element of the sequence, then recursively calls
// itself to play the next element in the sequence.
function playSequence(idxToPlay) {
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
  //if (playingSeq || playingTone) return;
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
  // startBtn.style.visibility = "hidden";
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
      score.innerText = playerSequence.length;
      statusMsg.innerText = "My Turn";
      playerSequence.length = 0;
      setTimeout(function () {
        startSimonSequence();
      }, TIME_BETWEEN_SPACES + TIME_BETWEEN_SEQ);
    }
  } else {
    init();
    statusMsg.innerText = "Game Over";
    playErrorTone();
    startBtn.disabled = false;
  }
}

function playTone(hertz) {
  // initializeSound();
  if (!ctx) ctx = new AudioContext();

  // if (playingTone) {
  if (osc) {
    console.log("already playing tone!");
    // TODO: if already playing, stop the current tone
    // before playing the new one - NOT WORKING!
    // gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.001);
    osc.stop();
    // osc = null;
    // playingTone = false;
    // return;
  }
  osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  // gain = ctx.createGain();
  // gain.connect(ctx.destination);
  // osc.connect(gain);
  osc.type = "sine";
  osc.frequency.value = hertz; // value in hertz
  // playingTone = true;
  osc.start();
  osc.stop(ctx.currentTime + TIME_TO_PLAY_TONE / 1000);
  // gain.gain.setValueAtTime(1, ctx.currentTime);
  // setTimeout(function () {
  //   // osc.stop();
  //   console.log("callback");
  //   gain.gain.exponentialRampToValueAtTime(
  //     0.00001,
  //     ctx.currentTime + TIME_RAMP_DOWN
  //   );
  //   setTimeout(function () {
  //     playingTone = false;
  //   }, WAIT_FOR_RAMP_DOWN);
  // }, TIME_TO_PLAY_TONE);
  //  stopTone(gain);
  // stopTone();
  // gain.gain.setValueAtTime(0, ctx.currentTime);
}

function playErrorTone() {
  if (!ctx) ctx = new AudioContext();
  if (osc) {
    console.log("already playing tone!");
    osc.stop();
  }
  osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.value = 150; // value in hertz
  osc.start();
  osc.stop(ctx.currentTime + TIME_TO_PLAY_TONE / 1000);
}

// function stopTone(stopGain) {
function stopTone() {
  // var stopGain = ctx.createGain();
  // stopGain.connect(ctx.destination);
  // osc.connect(stopGain);

  setTimeout(function () {
    // osc.stop();
    // console.log("callback");
    gain.gain.setValueAtTime(0, ctx.currentTime);
    // stopGain.gain.exponentialRampToValueAtTime(
    //   0.00001,
    //   ctx.currentTime + TIME_RAMP_DOWN
    // );
    // setTimeout(function () {
    //   playingTone = false;
    // }, WAIT_FOR_RAMP_DOWN);
    playingTone = false;
  }, TIME_TO_PLAY_TONE);
}

// function initializeSound() {
//   // if (!soundInitialized) {
//   if (!ctx) {
//     ctx = new AudioContext();
//     console.log("Sound initialized.");
//     // osc = ctx.createOscillator();
//     // osc.type = "sine";
//     // gain = ctx.createGain();
//     // osc.connect(gain);
//     // gain.connect(ctx.destination);
//     // gain.gain.setValueAtTime(0, ctx.currentTime);
//     // osc.start();
//     // soundInitialized = true;
//   }
// }
