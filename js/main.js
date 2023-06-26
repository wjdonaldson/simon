// Simon Game

/*----- constants -----*/

/*----- state variables -----*/
let sequence = [1];

/*----- cached elements  -----*/
const yellowEl = document.getElementById("tl");
console.log(yellowEl);
const blueEl = document.getElementById("tr");
const redEl = document.getElementById("bl");
const greenEl = document.getElementById("br");

const ctx = new AudioContext();
var osc = null;
var gain = null;
var playing = false;

/*----- event listeners -----*/

/*----- functions -----*/
init();

function init() {
  console.log("Initializing");
  yellowEl.addEventListener("click", onClickYellow);
  blueEl.addEventListener("click", onClickBlue);
  redEl.addEventListener("click", onClickRed);
  greenEl.addEventListener("click", onClickGreen);

  // renderSequence();
}

function renderSequence() {
  renderYellow();
  renderBlue();
  renderRed();
  renderGreen();
}

function renderYellow() {
  console.log("renderYellow");
  yellowEl.style.backgroundColor = "rgba(255, 255, 0, 1)";
}
function renderBlue() {
  console.log("renderBlue");
  blueEl.style.backgroundColor = "rgba(0, 0, 255, 1)";
}

function renderRed() {
  console.log("renderRed");
  redEl.style.backgroundColor = "rgba(255, 0, 0, 1)";
}

function renderGreen() {
  console.log("renderGreen");
  greenEl.style.backgroundColor = "rgba(0, 128, 0, 1)";
}

function onClickYellow() {
  renderYellow();
  playTone(277.183);
}

function onClickBlue() {
  renderBlue();
  playTone(391.995);
}

function onClickRed() {
  renderRed();
  playTone(329.628);
}

function onClickGreen() {
  renderGreen();
  playTone(783.991);
}

function playTone(hertz) {
  if (playing) {
    console.log("already playing");
    return;
  }
  playing = true;
  osc = ctx.createOscillator();
  gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  // osc.frequency.setValueAtTime(440, ctx.currentTime); // value in hertz
  osc.frequency.value = hertz; // value in hertz
  osc.start();
  setTimeout(function () {
    console.log("callback");
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
    playing = false;
  }, 1000);
}
