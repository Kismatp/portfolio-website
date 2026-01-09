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

// ---- Setup game ----
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

// ---- Calculate canvas points ----
function point(i) {
    return { x: PADDING + (i % 5) * GAP, y: PADDING + Math.floor(i / 5) * GAP };
}

// ---- Draw board ----
function draw() {
    ctx.clearRect(0,0,RES,RES);

    ctx.fillStyle = "#c8a165";
    ctx.fillRect(0,0,RES,RES);

    ctx.strokeStyle = "#3b2f1c";
    ctx.lineWidth = 3;

    // Draw grid lines
    for (let i = 0; i < SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(PADDING, PADDING + i * GAP);
        ctx.lineTo(RES - PADDING, PADDING + i * GAP);
        ctx.moveTo(PADDING + i * GAP, PADDING);
        ctx.lineTo(PADDING + i * GAP, RES - PADDING);
        ctx.stroke();
    }

    // Draw diagonals (full Baagh-Chal board)
    ctx.beginPath();
    ctx.moveTo(PADDING,PADDING);
    ctx.lineTo(RES-PADDING,RES-PADDING);
    ctx.moveTo(RES-PADDING,PADDING);
    ctx.lineTo(PADDING,RES-PADDING);

    ctx.moveTo(PADDING + 2*GAP,PADDING);
    ctx.lineTo(PADDING + 2*GAP, RES);
    ctx.moveTo(PADDING, PADDING + 2*GAP);
    ctx.lineTo(RES, PADDING + 2*GAP);

    ctx.stroke();

    // Highlight valid moves
    validMoves.forEach(i => {
        const {x,y} = point(i);
        ctx.beginPath();
        ctx.arc(x,y,8,0,Math.PI*2);
        ctx.fillStyle = "#00ff00";
        ctx.fill();
    });

    // Draw pieces
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

    // Highlight selected tiger
    if (selected !== null) {
        const {x,y} = point(selected);
        ctx.beginPath();
        ctx.arc(x,y,GAP*0.35,0,Math.PI*2);
        ctx.strokeStyle = "red";
        ctx.stroke();
    }
}

// ---- Click handler ----
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

// ---- Goat moves ----
function handleGoat(i) {
    if (goatsPlaced < 20 && !board[i]) {
        board[i] = "goat";
        goatsPlaced++;
        switchTurn();
    }
}

// ---- Tiger moves ----
function handleTiger(i) {
    if (board[i] === "tiger") {
        selected = i;
        validMoves = getTigerMoves(i);
        updateUI();
        return;
    }

    if (selected !== null && validMoves.includes(i)) {
        const row1 = Math.floor(selected/5);
        const col1 = selected%5;
        const row2 = Math.floor(i/5);
        const col2 = i%5;

        // capture if moving over goat
        let mid = null;
        if (Math.abs(row1-row2)===2 || Math.abs(col1-col2)===2) {
            mid = ((row1+row2)/2)*5 + (col1+col2)/2;
            if (board[mid]==="goat") {
                board[mid]=null;
                goatsCaptured++;
                if (goatsCaptured>=5) {
                    showPopup("🐯 Tiger Wins!","Tigers captured 5 goats.");
                    updateUI();
                    return;
                }
            }
        }

        board[i]="tiger";
        board[selected]=null;
        selected=null;
        validMoves=[];
        switchTurn();
    }
}

// ---- Get Tiger moves ----
function getTigerMoves(i){
    const moves=[];
    const row = Math.floor(i/5);
    const col = i%5;
    const dirs = [
        [-1,-1],[-1,0],[-1,1],
        [0,-1],       [0,1],
        [1,-1],[1,0],[1,1]
    ];

    dirs.forEach(([dr,dc])=>{
        const nr=row+dr, nc=col+dc;
        if(nr<0||nr>4||nc<0||nc>4) return;
        const ni=nr*5+nc;
        if(board[ni]===null) moves.push(ni);
        else if(board[ni]==="goat"){
            const jr=nr+dr,jc=nc+dc;
            if(jr<0||jr>4||jc<0||jc>4) return;
            const ji=jr*5+jc;
            if(board[ji]===null) moves.push(ji);
        }
    });
    return moves;
}

// ---- Check if Tigers are blocked ----
function areTigersBlocked(){
    return board
        .map((p,i)=>p==="tiger"?getTigerMoves(i).length:0)
        .every(m=>m===0);
}

// ---- Switch turns ----
function switchTurn(){
    turn = turn==="goat" ? "tiger":"goat";

    if(turn==="tiger" && areTigersBlocked()){
        showPopup("🐐 Goat Wins!","All tigers are blocked.");
        return;
    }

    resetTimer();
    updateUI();
}

// ---- Timer ----
function resetTimer(){
    clearInterval(timerInterval);
    timeLeft=30;
    document.getElementById("timer").innerText=`⏱ ${timeLeft}s`;
    timerInterval=setInterval(()=>{
        timeLeft--;
        document.getElementById("timer").innerText=`⏱ ${timeLeft}s`;
        if(timeLeft===0) switchTurn();
    },1000);
}

// ---- Update UI ----
function updateUI(){
    const indicator=document.getElementById("turnIndicator");
    indicator.textContent=turn==="goat"?"🐐 Goat":"🐯 Tiger";
    indicator.className="turn-indicator "+(turn==="tiger"?"tiger":"");

    document.getElementById("goatsLeft").innerText="Goats left: "+(20-goatsPlaced);
    document.getElementById("captured").innerText="Goats captured: "+goatsCaptured;
}

// ---- Popup ----
function showPopup(title,message){
    clearInterval(timerInterval);
    document.getElementById("popupTitle").innerText=title;
    document.getElementById("popupMessage").innerText=message;
    document.getElementById("popup").classList.remove("hidden");
}
function hidePopup(){ document.getElementById("popup").classList.add("hidden"); }

tigerImg.onload = goatImg.onload = resetGame;
