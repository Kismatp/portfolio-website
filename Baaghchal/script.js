// ────────────────────────────────────────────────
//     Baagh-Chal – Correct board & rules (2025)
// ────────────────────────────────────────────────

const TOTAL_POINTS = 25;

// Correct adjacency for 5×5 grid (all possible connections)
const CONNECTIONS = {
  0: [1, 5, 6],
  1: [0, 2, 6],
  2: [1, 3, 6, 7, 8],
  3: [2, 4, 8],
  4: [3, 8, 9],
  5: [0, 6, 10],
  6: [0, 1, 2, 5, 7, 10, 11, 12],
  7: [2, 6, 8, 12],
  8: [2, 3, 4, 7, 9, 12, 13, 14],
  9: [4, 8, 14],
  10: [5, 6, 11, 15, 16],
  11: [6, 10, 12, 16],
  12: [6, 7, 8, 11, 13, 16, 17, 18],
  13: [8, 12, 14, 18],
  14: [8, 9, 13, 18, 19],
  15: [10, 16, 20],
  16: [10, 11, 12, 15, 17, 20, 21, 22],
  17: [12, 16, 18, 22],
  18: [12, 13, 14, 17, 19, 22, 23, 24],
  19: [14, 18, 24],
  20: [15, 16, 21],
  21: [16, 20, 22],
  22: [16, 17, 18, 21, 23],
  23: [18, 22, 24],
  24: [18, 19, 23]
};

let board = Array(TOTAL_POINTS).fill(null);
let goatsPlaced = 0;
let goatsCaptured = 0;
let currentPlayer = "goat"; // "goat" or "tiger"
let selected = null;
let validMoves = [];
let playerSide = null;
let gameMode = null; // "pvp" | "ai"

const svg = document.getElementById("board-svg");
const boardDiv = document.getElementById("board");
const goatsPlacedEl = document.getElementById("goats-placed");
const goatsCapturedEl = document.getElementById("goats-captured");
const goatTurnEl = document.getElementById("goat-turn");
const tigerTurnEl = document.getElementById("tiger-turn");
const hintEl = document.getElementById("move-hint");
const modeDisplay = document.getElementById("mode-display");

// Fixed positions for 5x5 grid (in percentages)
const POSITIONS = [
  // Row 1: Top row
  [10, 10], [30, 10], [50, 10], [70, 10], [90, 10],
  // Row 2
  [10, 30], [30, 30], [50, 30], [70, 30], [90, 30],
  // Row 3: Middle row
  [10, 50], [30, 50], [50, 50], [70, 50], [90, 50],
  // Row 4
  [10, 70], [30, 70], [50, 70], [70, 70], [90, 70],
  // Row 5: Bottom row
  [10, 90], [30, 90], [50, 90], [70, 90], [90, 90]
];

// Fixed positions for SVG lines (in pixels) - ADJUSTED TO FIX EXTRA LINE
const SVG_POSITIONS = [
  // Row 1 - Adjusted last column to 358 instead of 360
  [40, 40], [120, 40], [200, 40], [280, 40], [358, 40],
  // Row 2
  [40, 120], [120, 120], [200, 120], [280, 120], [358, 120],
  // Row 3
  [40, 200], [120, 200], [200, 200], [280, 200], [358, 200],
  // Row 4
  [40, 280], [120, 280], [200, 280], [280, 280], [358, 280],
  // Row 5 - Adjusted last row to 358 instead of 360
  [40, 358], [120, 358], [200, 358], [280, 358], [358, 358]
];

// ─── Event Listeners ─────────────────────────────────────
document.getElementById("choose-goat").onclick = () => chooseSide("goat");
document.getElementById("choose-tiger").onclick = () => chooseSide("tiger");
document.getElementById("pvp-mode").onclick = () => startGame("pvp");
document.getElementById("ai-mode").onclick = () => startGame("ai");
document.getElementById("back-btn").onclick = () => location.reload();
document.getElementById("back-to-menu").onclick = () => location.reload();
document.getElementById("play-again").onclick = () => location.reload();
document.getElementById("howto-btn").onclick = () => {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("howto-screen").classList.add("active");
};
document.getElementById("howto-back").onclick = () => {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("menu-screen").classList.add("active");
};

// ─── Init ────────────────────────────────────────────────
drawBoardLines();
resetGame();

// ─── Functions ───────────────────────────────────────────
function chooseSide(side) {
  playerSide = side;
  document.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
  document.getElementById(`choose-${side}`).classList.add("selected");
  document.getElementById("mode-selection").style.display = "block";
}

function startGame(mode) {
  gameMode = mode;
  resetGame();
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("game-screen").classList.add("active");
  modeDisplay.textContent = mode === "ai" ? "vs AI" : "Pass & Play";
  updateUI();
  if (gameMode === "ai" && playerSide === "tiger") setTimeout(aiMove, 400);
}

function resetGame() {
  board.fill(null);
  // Tigers start at the four corners (positions 0, 4, 20, 24)
  board[0] = board[4] = board[20] = board[24] = "tiger";
  goatsPlaced = 0;
  goatsCaptured = 0;
  currentPlayer = "goat";
  selected = null;
  validMoves = [];
  renderBoard();
  updateUI();
}

function drawBoardLines() {
  svg.innerHTML = "";
  
  for (let i = 0; i < TOTAL_POINTS; i++) {
    CONNECTIONS[i].forEach(j => {
      if (i >= j) return;
      
      const [x1, y1] = SVG_POSITIONS[i];
      const [x2, y2] = SVG_POSITIONS[j];
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", "#5d4037");
      line.setAttribute("stroke-width", "3");
      svg.appendChild(line);
    });
  }
}

function renderBoard() {
  boardDiv.innerHTML = "";
  
  for (let i = 0; i < TOTAL_POINTS; i++) {
    const point = document.createElement("div");
    point.className = "point";
    
    // Use fixed percentage positions
    const [left, top] = POSITIONS[i];
    point.style.left = `${left}%`;
    point.style.top = `${top}%`;
    
    point.onclick = () => handleClick(i);

    if (board[i]) {
      const piece = document.createElement("div");
      piece.className = "piece";
      piece.textContent = board[i] === "goat" ? "🐐" : "🐅";
      point.appendChild(piece);
    }

    if (i === selected) point.classList.add("selected");
    if (validMoves.includes(i)) point.classList.add("valid");

    boardDiv.appendChild(point);
  }
}

function handleClick(pos) {
  if (gameMode === "ai" && currentPlayer !== playerSide) return;

  // Goat placement phase
  if (currentPlayer === "goat" && goatsPlaced < 20) {
    if (board[pos] === null) {
      board[pos] = "goat";
      goatsPlaced++;
      endTurn();
      renderBoard();
      updateUI();
      return;
    }
  }

  // Moving phase
  if (selected === null) {
    // Selecting a piece
    if (board[pos] === currentPlayer) {
      selected = pos;
      validMoves = getValidMoves(pos);
    }
  } else {
    // Moving a selected piece
    if (validMoves.includes(pos)) {
      performMove(selected, pos);
      selected = null;
      validMoves = [];
      endTurn();
    } else if (board[pos] === currentPlayer) {
      // Select a different piece of the same type
      selected = pos;
      validMoves = getValidMoves(pos);
    } else {
      // Cancel selection
      selected = null;
      validMoves = [];
    }
  }

  renderBoard();
  updateUI();
}

function getValidMoves(from) {
  const moves = [];
  const piece = board[from];

  // Regular adjacent moves
  CONNECTIONS[from].forEach(adj => {
    if (board[adj] === null) {
      moves.push(adj);
    }
  });

  // Tiger jumps (capture moves)
  if (piece === "tiger") {
    CONNECTIONS[from].forEach(mid => {
      if (board[mid] === "goat") {
        // Find jump destination
        const fromRow = Math.floor(from / 5);
        const fromCol = from % 5;
        const midRow = Math.floor(mid / 5);
        const midCol = mid % 5;
        
        // Calculate jump destination (2 steps in same direction)
        const jumpRow = 2 * midRow - fromRow;
        const jumpCol = 2 * midCol - fromCol;
        
        // Check if destination is valid
        if (jumpRow >= 0 && jumpRow < 5 && jumpCol >= 0 && jumpCol < 5) {
          const jumpIndex = jumpRow * 5 + jumpCol;
          
          // Check if the points are connected properly
          if (CONNECTIONS[from].includes(mid) && 
              CONNECTIONS[mid].includes(jumpIndex) &&
              board[jumpIndex] === null) {
            moves.push(jumpIndex);
          }
        }
      }
    });
  }

  return moves;
}

function performMove(from, to) {
  const piece = board[from];
  board[from] = null;
  board[to] = piece;

  // Check for tiger capture
  if (piece === "tiger") {
    const fromRow = Math.floor(from / 5);
    const fromCol = from % 5;
    const toRow = Math.floor(to / 5);
    const toCol = to % 5;
    
    // Check if this was a jump (distance of 2 spaces)
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    if (Math.abs(rowDiff) === 2 || Math.abs(colDiff) === 2) {
      // Calculate the jumped position (middle point)
      const midRow = fromRow + rowDiff / 2;
      const midCol = fromCol + colDiff / 2;
      const midIndex = midRow * 5 + midCol;
      
      if (board[midIndex] === "goat") {
        board[midIndex] = null;
        goatsCaptured++;
      }
    }
  }
}

function endTurn() {
  if (checkWin()) return;
  currentPlayer = currentPlayer === "goat" ? "tiger" : "goat";
  updateUI();
  if (gameMode === "ai" && currentPlayer !== playerSide) {
    setTimeout(aiMove, 360);
  }
}

function checkWin() {
  if (goatsCaptured >= 5) {
    endGame("tiger");
    return true;
  }

  if (goatsPlaced < 20) return false;

  // Check if all tigers are blocked
  let blocked = 0;
  for (let i = 0; i < TOTAL_POINTS; i++) {
    if (board[i] === "tiger") {
      const moves = getValidMoves(i);
      if (moves.length === 0) {
        blocked++;
      }
    }
  }
  if (blocked === 4) {
    endGame("goat");
    return true;
  }
  
  return false;
}

function endGame(winner) {
  document.getElementById("winner-icon").textContent = winner === "goat" ? "🐐" : "🐅";
  document.getElementById("gameover-title").textContent = winner === "goat" ? "Goats Win!" : "Tigers Win!";
  document.getElementById("gameover-message").textContent =
    winner === "goat" ? "All tigers are blocked." : `${goatsCaptured} goats captured.`;
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("gameover-screen").classList.add("active");
}

function updateUI() {
  goatsPlacedEl.textContent = `${goatsPlaced}/20`;
  goatsCapturedEl.textContent = goatsCaptured;

  goatTurnEl.classList.toggle("active", currentPlayer === "goat");
  tigerTurnEl.classList.toggle("active", currentPlayer === "tiger");

  if (goatsPlaced < 20 && currentPlayer === "goat") {
    hintEl.textContent = `Place goat ${goatsPlaced + 1} of 20`;
  } else if (selected !== null) {
    hintEl.textContent = "Select destination";
  } else {
    hintEl.textContent = currentPlayer === "goat" ? "Goat's turn" : "Tiger's turn";
  }
}

// ─── AI Logic ──────────────────────────────────────
function aiMove() {
  if (currentPlayer === "goat") {
    if (goatsPlaced < 20) {
      // Goat placement phase - prefer center positions
      const centerPositions = [12, 6, 8, 16, 18, 7, 11, 13, 17];
      let emptySpots = [];
      
      // Try center positions first
      for (let pos of centerPositions) {
        if (board[pos] === null) {
          emptySpots.push(pos);
        }
      }
      
      // If no center spots available, find any empty spot
      if (emptySpots.length === 0) {
        for (let i = 0; i < TOTAL_POINTS; i++) {
          if (board[i] === null) emptySpots.push(i);
        }
      }
      
      if (emptySpots.length > 0) {
        const pos = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        board[pos] = "goat";
        goatsPlaced++;
      }
    } else {
      // Goat moving phase
      const moves = getAllMoves("goat");
      if (moves.length > 0) {
        const { from, to } = moves[Math.floor(Math.random() * moves.length)];
        performMove(from, to);
      }
    }
  } else {
    // Tiger moving phase
    const moves = getAllMoves("tiger");
    if (moves.length === 0) {
      endTurn();
      return;
    }
    
    // Prioritize capture moves
    const captureMoves = [];
    const regularMoves = [];
    
    moves.forEach(move => {
      const fromRow = Math.floor(move.from / 5);
      const fromCol = move.from % 5;
      const toRow = Math.floor(move.to / 5);
      const toCol = move.to % 5;
      
      // Check if this is a capture move (jump of 2 spaces)
      if (Math.abs(toRow - fromRow) === 2 || Math.abs(toCol - fromCol) === 2) {
        captureMoves.push(move);
      } else {
        regularMoves.push(move);
      }
    });
    
    const chosen = captureMoves.length > 0 ? captureMoves : regularMoves;
    const { from, to } = chosen[Math.floor(Math.random() * chosen.length)];
    performMove(from, to);
  }

  renderBoard();
  if (checkWin()) return;
  endTurn();
}

function getAllMoves(player) {
  const moves = [];
  for (let i = 0; i < TOTAL_POINTS; i++) {
    if (board[i] === player) {
      getValidMoves(i).forEach(to => moves.push({ from: i, to }));
    }
  }
  return moves;
}