let mainTable = document.getElementById("mainTable");
let sounding = false;
let timerID;
let newLineRow;
let currentRow;
let repetitions; // initial
let rhythmMS;
let rhythmCurrent; // [inhale, hold, exhale]
let currentPhase;
let initialAmountInCP; // initialAmountInCurrentPhase
let playedInCP; // playedInCurrentPhase
let thisRowRepeated; // times


mainTable.addEventListener('click', tableClickHandler);


function tableClickHandler(e) {
  repetitions = document.getElementById("repAmount").value;
  rhythmMS = ( 60000 / document.getElementById("bpm").value);
  
  if ( sounding == true ) {
    clearInterval(timerID);
    sounding = false;
    return;
  }

  let clickedRow = e.target.parentNode;
  newLineRow = clickedRow;
  if ( !clickedRow.classList.contains('new-line') ) {
    newLineRow = getNewLineRow(clickedRow);
  }

  rhythmCurrent = getrhythmNumbers(newLineRow);
  timerID = setInterval(tick, rhythmMS);
  sounding = true;

}



function tick() {
  let phase = whichPhase();
  ding(phase);
}



function whichPhase() {

  if ( !currentPhase ) { // very first ding
    currentRow = newLineRow;
    currentPhase = 'inhale';
    initialAmountInCP = rhythmCurrent[0];
    playedInCP = 1;
    thisRowRepeated = 0;
  } else if ( currentPhase == 'inhale' ) { // inhale phase check
    let amountCPLeft = initialAmountInCP - playedInCP; // amountCPLeft = amount repititions in current phase left
    if ( amountCPLeft < 1 ) {
      currentPhase = 'hold';
      playedInCP = 1;
      initialAmountInCP = rhythmCurrent[1];
    } else {
      playedInCP += 1;
    }
  } else if ( currentPhase == 'hold' ) { // hold phase check
    let amountCPLeft = initialAmountInCP - playedInCP;
    if ( amountCPLeft < 1 ) {
      currentPhase = 'exhale';
      playedInCP = 1;
      initialAmountInCP = rhythmCurrent[2];
    } else {
      playedInCP += 1;
    }
  } else if ( currentPhase == 'exhale' ) { // exhale phase check
    let amountCPLeft = initialAmountInCP - playedInCP;
    if ( amountCPLeft < 1 ) {
      thisRowRepeated += 1;

      if ( repetitions - thisRowRepeated < 1 ) { // starting a new row
        console.log('starting a new row');
        getNextRow();
        currentPhase = 'inhale';
        initialAmountInCP = rhythmCurrent[0];
        playedInCP = 1;

      } else { // starting this row ones again
        console.log('starting this row ones again');
        currentPhase = 'inhale';
        playedInCP = 1;
        initialAmountInCP = rhythmCurrent[0];
      }
    } else {
      playedInCP += 1;
    }
  } 


  return currentPhase;
}


function getNextRow() {

  currentRow = currentRow.nextElementSibling;
  rhythmCurrent = getrhythmNumbers(currentRow);
  thisRowRepeated = 0;

}


function ding(phase) {

  switch (phase) {
    case 'inhale':
      let ding1 = new Audio(src="./sounds/ding1.mp3");
      ding1.play();
      console.log('inhale ding');
      break;
    case 'hold':
      let ding2 = new Audio(src="./sounds/ding2.wav");
      ding2.play();
      console.log('hold ding');
      break;
    case 'exhale':
      let ding3 = new Audio(src="./sounds/ding3.wav");
      ding3.play();
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



function soundRow(rhythm) {

  let ding1 = new Audio(src="./sounds/ding1.mp3");
  let ding2 = new Audio(src="./sounds/ding2.wav");
  let ding3 = new Audio(src="./sounds/ding3.wav");
    
  ding3.play();

}


