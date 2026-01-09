const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const RES = 500;
canvas.width = RES;
canvas.height = RES;

const SIZE = 5;
const PADDING = 40;
const GAP = (RES - PADDING * 2) / (SIZE - 1);

const tigerImg = new Image();
const goatImg = new Image();
tigerImg.src = "assets/tiger.webp";
goatImg.src = "assets/goat.webp";

let board, turn, goatsPlaced, goatsCaptured;
let selected = null;
let validMoves = [];
let timeLeft = 30;
let timerInterval = null;

const directions = [-6, -5, -4, -1, 1, 4, 5, 6];

function resetGame() {
    hidePopup();

  board = Array(25).fill(null);
  [0,4,20,24].forEach(i => board[i] = "tiger");

  turn = "goat";
  goatsPlaced = 0;
  goatsCaptured = 0;
  selected = null;
  validMoves = [];

  resetTimer();
  updateUI();
  draw();
}

function point(i) {
  return {
    x: PADDING + (i % 5) * GAP,
    y: PADDING + Math.floor(i / 5) * GAP
  };
}

function draw() {
  ctx.clearRect(0,0,RES,RES);

  ctx.fillStyle = "#c8a165";
  ctx.fillRect(0,0,RES,RES);

  ctx.strokeStyle = "#3b2f1c";
  ctx.lineWidth = 3;

  for (let i = 0; i < SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + i * GAP);
    ctx.lineTo(RES - PADDING, PADDING + i * GAP);
    ctx.moveTo(PADDING + i * GAP, PADDING);
    ctx.lineTo(PADDING + i * GAP, RES - PADDING);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(PADDING,PADDING);
  ctx.lineTo(RES-PADDING,RES-PADDING);
  ctx.moveTo(RES-PADDING,PADDING);
  ctx.lineTo(PADDING,RES-PADDING);
  ctx.stroke();

  validMoves.forEach(i => {
    const {x,y} = point(i);
    ctx.beginPath();
    ctx.arc(x,y,8,0,Math.PI*2);
    ctx.fillStyle = "#00ff00";
    ctx.fill();
  });

  board.forEach((p,i) => {
    if (!p) return;
    const {x,y} = point(i);
    const r = GAP * 0.28;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.clip();
    ctx.drawImage(p==="tiger"?tigerImg:goatImg, x-r, y-r, r*2, r*2);
    ctx.restore();
  });

  if (selected !== null) {
    const {x,y} = point(selected);
    ctx.beginPath();
    ctx.arc(x,y,GAP*0.35,0,Math.PI*2);
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const scale = RES / rect.width;

  const mx = (e.clientX - rect.left) * scale;
  const my = (e.clientY - rect.top) * scale;

  const x = Math.round((mx - PADDING) / GAP);
  const y = Math.round((my - PADDING) / GAP);
  const idx = y * 5 + x;

  if (idx < 0 || idx > 24) return;

  if (turn === "goat") handleGoat(idx);
  else handleTiger(idx);

  draw();
});

function handleGoat(i) {
  if (goatsPlaced < 20 && !board[i]) {
    board[i] = "goat";
    goatsPlaced++;
    switchTurn();
  }
}

function handleTiger(i) {
  if (board[i] === "tiger") {
    selected = i;
    validMoves = getTigerMoves(i);
    return;
  }

  if (selected !== null && validMoves.includes(i)) {
    const mid = (selected + i) / 2;
    if (board[mid] === "goat") {
        board[mid] = null;
        goatsCaptured++;
      
        if (goatsCaptured >= 5) {
          showPopup("🐯 Tiger Wins!", "Tigers captured 5 goats.");
          return;
        }
      }
      function areTigersBlocked() {
        return board
          .map((p,i) => p === "tiger" ? getTigerMoves(i).length : 0)
          .every(moves => moves === 0);
      }
            
    board[i] = "tiger";
    board[selected] = null;
    selected = null;
    validMoves = [];
    switchTurn();
  }
}

function getTigerMoves(i) {
    const row = Math.floor(i / 5);
    const col = i % 5;

    const potentialMoves = [];

    directions.forEach(d => {
        const n = i + d;
        const j = i + d*2;

        if (n < 0 || n > 24) return;  // out of board
        const nRow = Math.floor(n / 5);
        const nCol = n % 5;

        // prevent wrap-around
        if (Math.abs(nRow - row) > 1 || Math.abs(nCol - col) > 1) return;

        if (board[n] === null) {
            potentialMoves.push(n);
        } else if (board[n] === "goat" && j >= 0 && j < 25 && board[j] === null) {
            const jRow = Math.floor(j / 5);
            const jCol = j % 5;
            if (Math.abs(jRow - row) <= 2 && Math.abs(jCol - col) <= 2) {
                potentialMoves.push(j);
            }
        }
    });

    return potentialMoves;
}


function switchTurn() {
    turn = turn === "goat" ? "tiger" : "goat";
  
    if (turn === "tiger" && areTigersBlocked()) {
      showPopup("🐐 Goat Wins!", "All tigers are blocked.");
      return;
    }
  
    resetTimer();
    updateUI();
  }
  
function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 30;
  document.getElementById("timer").innerText = `⏱ ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `⏱ ${timeLeft}s`;
    if (timeLeft === 0) switchTurn();
  }, 1000);
}

function updateUI() {
  const indicator = document.getElementById("turnIndicator");
  indicator.textContent = turn === "goat" ? "🐐 Goat" : "🐯 Tiger";
  indicator.className = "turn-indicator " + (turn === "tiger" ? "tiger" : "");

  document.getElementById("goatsLeft").innerText =
    "Goats left: " + (20 - goatsPlaced);
  document.getElementById("captured").innerText =
    "Goats captured: " + goatsCaptured;
}

tigerImg.onload = goatImg.onload = resetGame;

function showPopup(title, message) {
    clearInterval(timerInterval);
    document.getElementById("popupTitle").innerText = title;
    document.getElementById("popupMessage").innerText = message;
    document.getElementById("popup").classList.remove("hidden");
  }
  
  function hidePopup() {
    document.getElementById("popup").classList.add("hidden");
  }
  