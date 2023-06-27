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

/*----- state variables -----*/
let sequence = [4, 3, 2, 1, 1];

/*----- cached elements  -----*/
const board = document.getElementById("board");
const startBtn = document.getElementById("game-start-btn");
// const tlEl = document.getElementById("tl");
// const trEl = document.getElementById("tr");
// const blEl = document.getElementById("bl");
// const brEl = document.getElementById("br");

const ctx = new AudioContext();
var osc = null;
var gain = null;
var playing = false;
var playingSeq = false;

/*----- event listeners -----*/

/*----- functions -----*/
init();

function init() {
  console.log("Initializing");
  board.addEventListener("click", onClickSpace);
  startBtn.addEventListener("click", onClickStart);
}

function playSequence(idxToPlay) {
  console.log(`playSequence(${idxToPlay})`);
  if (idxToPlay === sequence.length) {
    playingSeq = false;
    console.log("Done playing sequence");
    return;
  }
  for (let space in SPACES) {
    if (SPACES[space].num === sequence[idxToPlay]) {
      console.log(`iterate, ${sequence[idxToPlay]}`);
      playingSeq = true;
      const el = document.getElementById(space);
      renderSpace(el);
    }
  }
  setTimeout(function () {
    playSequence(idxToPlay + 1);
  }, 2000);
}

function renderSpace(el) {
  console.log("renderSpace");
  const space = el.getAttribute("id");
  el.style.backgroundColor = SPACES[space].onColor;
  playTone(SPACES[space].freq);
}

function onClickSpace(evt) {
  renderSpace(evt.target);
  const space = evt.target.getAttribute("id");
  // playTone(SPACES[space].freq);
}

function onClickStart(evt) {
  playSequence(0);
}

function playTone(hertz) {
  if (playing) {
    console.log("already playing");
    // TODO: if already playing, stop the current tone
    // before playing the new one - NOT WORKING!
    // gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.001);
    // playing = false;
    return;
  }
  osc = ctx.createOscillator();
  gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = hertz; // value in hertz
  playing = true;
  osc.start();
  setTimeout(function () {
    console.log("callback");
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    setTimeout(function () {
      playing = false;
    }, 500);
  }, 1000);
}
