// ----------------------- initial -----------------------
let mainTable = document.getElementById("mainTable");

let tickState = {};
// tickState contains:
// timerID
// newLineRow
// currentRow
// repetitions - initial
// rhythmMS
// rhythmCurrent - [inhale, hold, exhale] (array with amount in each phase)
// currentPhase - 0 == inhale / 1 == hold / 2 == exhale
// initialAmountInCP - initialAmountInCurrentPhase
// playedInCP - playedInCurrentPhase
// thisRowRepeated -  times
tickState.sounding = false;

let ding1 = new Audio(src="./sounds/ding1.mp3");
let ding2 = new Audio(src="./sounds/ding2.wav");
let ding3 = new Audio(src="./sounds/ding3.wav");
let playing;

mainTable.addEventListener('click', tableClickHandler);



// ----------------------- functions -----------------------


function tableClickHandler(e) {
  tickState.repetitions = document.getElementById("repAmount").value;
  tickState.rhythmMS = ( 60000 / document.getElementById("bpm").value);
  
  if ( tickState.sounding == true ) {
    clearInterval(tickState.timerID);
    console.log('STOPPED!');
    tickState.sounding = false;
    return;
  }

  let clickedRow = e.target.parentNode;
  tickState.newLineRow = clickedRow;
  if ( !clickedRow.classList.contains('new-line') ) {
    tickState.newLineRow = getNewLineRow(clickedRow);
  }

  tickState.rhythmCurrent = getrhythmNumbers(tickState.newLineRow);
  tickState.timerID = setInterval(tick, tickState.rhythmMS);
  tickState.sounding = true;

}



function tick() {
  let phase = whichPhase();
  tdVisualEffects();
  ding(phase);
}



function whichPhase() {

  if ( tickState.currentPhase == undefined ) { // very first ding
    tickState.currentRow = tickState.newLineRow;
    tickState.currentPhase = 0;
    tickState.initialAmountInCP = tickState.rhythmCurrent[0];
    tickState.playedInCP = 1;
    tickState.thisRowRepeated = 0;
  } else if ( tickState.currentPhase == 0 ) { // inhale phase check
    let amountCPLeft = tickState.initialAmountInCP - tickState.playedInCP; // amountCPLeft = amount repititions in current phase left

    if ( amountCPLeft < 1 ) {
      tickState.currentPhase = 1;
      tickState.playedInCP = 1;
      tickState.initialAmountInCP = tickState.rhythmCurrent[1];
    } else {
      tickState.playedInCP += 1;
    }
  } else if ( tickState.currentPhase == 1 ) { // hold phase check
    let amountCPLeft = tickState.initialAmountInCP - tickState.playedInCP;
    if ( amountCPLeft < 1 ) {
      tickState.currentPhase = 2;
      tickState.playedInCP = 1;
      tickState.initialAmountInCP = tickState.rhythmCurrent[2];
    } else {
      tickState.playedInCP += 1;
    }
  } else if ( tickState.currentPhase == 2 ) { // exhale phase check
    let amountCPLeft = tickState.initialAmountInCP - tickState.playedInCP;
    if ( amountCPLeft < 1 ) {
      tickState.thisRowRepeated += 1;

      if ( tickState.repetitions - tickState.thisRowRepeated < 1 ) { // starting a new row
        console.log('starting a new row');
        getNextRow();
        tickState.currentPhase = 0;
        tickState.initialAmountInCP = tickState.rhythmCurrent[0];
        tickState.playedInCP = 1;

      } else { // starting this row ones again
        console.log('starting this row ones again');
        tickState.currentPhase = 0;
        tickState.playedInCP = 1;
        tickState.initialAmountInCP = tickState.rhythmCurrent[0];
      }
    } else {
      tickState.playedInCP += 1;
    }
  } 


  return tickState.currentPhase;
}



function getNextRow() {

  tickState.currentRow = tickState.currentRow.nextElementSibling;
  tickState.rhythmCurrent = getrhythmNumbers(tickState.currentRow);
  tickState.thisRowRepeated = 0;

}


// playing sounds
function ding(phase) {

  switch (phase) {
    case 0: // 'inhale'
      if ( playing ) {
        playing.pause();
        playing.currentTime = 0;
      }
      playing = ding1;
      playing.play();
      console.log('inhale ding');
      break;
    case 1: // 'hold'
      if ( playing ) {
        playing.pause();
        playing.currentTime = 0;
      }
      playing = ding2;
      playing.play();
      console.log('hold ding');
      break;
    case 2: // 'exhale'
      if ( playing ) {
        playing.pause();
        playing.currentTime = 0;
      }
      playing = ding3;
      playing.play();
      console.log('exhale ding');
      break;
  }
  
}



function getNewLineRow(row) {

  while ( !row.classList.contains('new-line') ) {
    row = row.previousElementSibling;
  }

  return row;

}



function getrhythmNumbers(row) {
  return [+row.children[0].textContent, +row.children[1].textContent, +row.children[2].textContent];
}


function tdVisualEffects() {

  tickState.currentRow.children[tickState.currentPhase].classList.add("playing-row");
}

