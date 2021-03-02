// ----------------------- initial -----------------------
let bpm = document.getElementById("bpm");
let repAmount = document.getElementById("repAmount");
let mainTable = document.getElementById("mainTable");
let questionMark = document.getElementById("questionMark");

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
// currentTD
// thigle
tickState.sounding = false;

let ding1 = new Audio(src="./sounds/ding1.mp3");
let ding2 = new Audio(src="./sounds/ding2.wav");
let ding3 = new Audio(src="./sounds/ding3.wav");
let playing;

bpm.addEventListener('blur', bpmBlurHandler);
repAmount.addEventListener('blur', repAmountBlurHandler);
mainTable.addEventListener('click', tableClickHandler);
questionMark.addEventListener('click', showHelp);

// ----------------------- noSleep -----------------------

let noSleep = new NoSleep();
// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
document.addEventListener('click', function enableNoSleep() {
  document.removeEventListener('click', enableNoSleep, false);
  noSleep.enable();
}, false);

// ----------------------- functions -----------------------

// check BPM value on blur and set acceptable value
function bpmBlurHandler(e) {
  let bpmVal = bpm.value;
  if ( bpmVal > 150 ) {
    bpm.value = 150;
    } else if ( bpmVal < 10 ) {
      bpm.value = 10;
    } else if ( isNaN(bpmVal) ) {
      bpm.value = 60;
    }
}


// check amount of repitition value on blur and set acceptable value
function repAmountBlurHandler(e) {
  let repAmountVal = repAmount.value;
  if ( repAmountVal > 999 ) {
    repAmount.value = 999;
    } else if ( repAmountVal < 1 ) {
      repAmount.value = 1;
    } else if ( isNaN(repAmountVal) ) {
      repAmount.value = 10;
    }

}


function tableClickHandler(e) {
  tickState.repetitions = document.getElementById("repAmount").value;
  tickState.rhythmMS = ( 60000 / document.getElementById("bpm").value);
  
  if ( tickState.sounding == true ) {
    stop();
    return;
  }

  if ( e.target.tagName != 'TD' ) {
    return;
  }
  let clickedRow = e.target.parentNode;
  tickState.newLineRow = clickedRow;

  tickState.rhythmCurrent = getrhythmNumbers(tickState.newLineRow);
  tickState.timerID = setInterval(tick, tickState.rhythmMS);
  tickState.sounding = true;

}



function tick() {
  let phase = whichPhase();
  if ( tickState.currentPhase == undefined ) return // stop if getNextRow() detected end of table
  tdVisualEffects();
  ding(phase);
}


function stop() {
  clearInterval(tickState.timerID);
  console.log('STOPPED!');
  if ( tickState.currentTD ) {
    tickState.currentTD.classList.remove("playing-td");
    removeThigles();
  }
  tickState = {};
  tickState.sounding = false;
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
        getNextRow();
        if ( tickState.currentPhase == undefined ) return // stop if getNextRow() detected end of table
        console.log('starting a new row');
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

  if ( tickState.currentRow.nextElementSibling ) {
    tickState.currentRow = tickState.currentRow.nextElementSibling;
// scroll down the page if the next row is outside of the screen
    let box = tickState.currentRow.getBoundingClientRect();
    let toBottom = window.innerHeight - box.bottom;
    console.log(toBottom);
    if ( toBottom < 30 ) {
      window.scroll(0, (window.scrollY + 29));
    }

    tickState.rhythmCurrent = getrhythmNumbers(tickState.currentRow);
    tickState.thisRowRepeated = 0;
  } else {
    stop();
  }

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



function getrhythmNumbers(row) {
  if ( row.children[0] ) return [+row.children[0].textContent, +row.children[1].textContent, +row.children[2].textContent];
}


function tdVisualEffects() {

  tickState.currentTD = tickState.currentRow.children[tickState.currentPhase]
  tickState.currentTD.classList.add("playing-td");

  tickState.thigle = document.createElement("div");
  tickState.thigle.classList.add("thigle");
  tickState.currentTD.append(tickState.thigle);

  setTimeout(() => {
    if ( tickState.thigle ) tickState.thigle.style.opacity = "0.2";
  }, 50);


  setTimeout(() => {
    removeThigles();
    if ( tickState.currentTD ) tickState.currentTD.classList.remove("playing-td");
  }, (tickState.rhythmMS - 35));
}


function removeThigles() {
  let thigles = mainTable.querySelectorAll('.thigle');
  for (let thigle of thigles) {
    thigle.parentNode.removeChild(thigle);
  }
}


function showHelp() {

  // Get the modal
  var modal = document.getElementById("myModal");
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  
  // When the user clicks on the button, open the modal
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  span.addEventListener('click', function() {
    modal.style.display = "none";
  })

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  })

  window.addEventListener('keydown', function(event) {
    
    if ( event.key == 'Escape' ) {
      modal.style.display = "none";
    }
  })

}

