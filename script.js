const positions = [
  { x: 0.4046, y: 0.1895 }, // 0 top
  { x: 0.6677, y: 0.2143 }, // 1 top-right
  { x: 0.8032, y: 0.3674 }, // 2 right
  { x: 0.8244, y: 0.6340 }, // 3 bottom-right
  { x: 0.6206, y: 0.8714 }, // 4 bottom
  { x: 0.3079, y: 0.8297 }, // 5 bottom-left
  { x: 0.1831, y: 0.5822 }, // 6 left
  { x: 0.2310, y: 0.3433 }, // 7 top-left (NOW EXACT)
  { x: 0.5119, y: 0.5003 }  // 8 center
];

// connections between nodes
const connections = {
  0: [1,7,8],
  1: [0,2,8],
  2: [1,3,8],
  3: [2,4,8],
  4: [3,5,8],
  5: [4,6,8],
  6: [5,7,8],
  7: [6,0,8],
  8: [0,1,2,3,4,5,6,7]
};

const winningLines = [
  [0,8,4],
  [1,8,5],
  [2,8,6],
  [3,8,7]
];

let board = Array(9).fill(null);
let currentPlayer = 1;
let placed = {1:0, 2:0};
let selected = null;

const game = document.getElementById("game");
const piecesContainer = document.getElementById("pieces");
const boardImg = document.getElementById("board");

// ---- helpers ----
function getPixelPos(index) {
  const rect = boardImg.getBoundingClientRect();
  return {
    x: positions[index].x * rect.width,
    y: positions[index].y * rect.height
  };
}

function updatePiece(el, index) {
  const p = getPixelPos(index);
  const size = 40;

  el.style.left = (p.x - size / 2) + "px";
  el.style.top = (p.y - size / 2) + "px";
}

// ---- game logic ----
function checkWin(player) {
  return winningLines.some(line =>
    line.every(i => board[i] === player)
  );
}

// ---- pieces ----
function createPiece(player, index) {
  const el = document.createElement("img");
  el.src = player === 1 ? "stone1.png" : "stone2.png";
  el.classList.add("piece");

  el.dataset.index = index;
  el.dataset.player = player;

  updatePiece(el, index);

  el.onclick = () => {
    // only after placing phase
    if (placed[1] < 3 || placed[2] < 3) return;
    if (player !== currentPlayer) return;

    document.querySelectorAll(".piece").forEach(p => p.classList.remove("selected"));
    el.classList.add("selected");

    selected = {el, from: index};
  };

  piecesContainer.appendChild(el);
}

// ---- main click handler ----
function onClick(index) {

  // PHASE 1: placing
  if (placed[currentPlayer] < 3) {
    if (board[index] !== null) return;

    board[index] = currentPlayer;
    createPiece(currentPlayer, index);
    placed[currentPlayer]++;

    if (checkWin(currentPlayer)) {
      setTimeout(() => alert("Player " + currentPlayer + " wins!"), 100);
      return;
    }

    currentPlayer = 3 - currentPlayer;
  }

  // PHASE 2: moving
  else if (selected) {
    if (board[index] !== null) return;

    // must be connected
    if (!connections[selected.from].includes(index)) return;

    // move piece
    board[selected.from] = null;
    board[index] = currentPlayer;

    updatePiece(selected.el, index);
    selected.el.dataset.index = index;

    selected.el.classList.remove("selected");
    selected = null;

    if (checkWin(currentPlayer)) {
      setTimeout(() => alert("Player " + currentPlayer + " wins!"), 100);
      return;
    }

    currentPlayer = 3 - currentPlayer;
  }
}

// ---- clickable dots ----
function createDots() {
  document.querySelectorAll(".dot").forEach(e => e.remove());

  positions.forEach((pos, index) => {
    const d = document.createElement("div");
    d.classList.add("dot");

    const p = getPixelPos(index);
    d.style.left = (p.x - 11) + "px";
    d.style.top = (p.y - 11) + "px";

    d.onclick = () => onClick(index);

    game.appendChild(d);
  });
}

// ---- init ----
window.onload = () => {
  createDots();
};

window.onresize = () => {
  createDots();

  document.querySelectorAll(".piece").forEach(el => {
    const index = parseInt(el.dataset.index);
    updatePiece(el, index);
  });
};
