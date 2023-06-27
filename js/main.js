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
    num: 2,
    offColor: "rgba(255, 0, 0, 0.5)",
    onColor: "rgba(255, 0, 0, 1)",
    freq: 329.6, // E;
  },
  br: {
    num: 2,
    offColor: "rgba(0, 128, 0, 0.5)",
    onColor: "rgba(0, 128, 0, 1)",
    freq: 784.0, // G (up octive);
  },
};

/*----- state variables -----*/
let sequence = [1];

/*----- cached elements  -----*/
const board = document.getElementById("board");
const tlEl = document.getElementById("tl");
const trEl = document.getElementById("tr");
const blEl = document.getElementById("bl");
const brEl = document.getElementById("br");

const ctx = new AudioContext();
var osc = null;
var gain = null;
var playing = false;

/*----- event listeners -----*/

/*----- functions -----*/
init();

function init() {
  console.log("Initializing");
  board.addEventListener("click", onClickSpace);

  // renderSequence();
}

function renderSequence() {}

function renderSpace(el) {
  console.log("renderSpace");
  console.log(el);
  const space = el.getAttribute("id");
  console.log(space);
  el.style.backgroundColor = SPACES[space].onColor;
}

function onClickSpace(evt) {
  renderSpace(evt.target);
  const space = evt.target.getAttribute("id");
  playTone(SPACES[space].freq);
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
