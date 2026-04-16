const BOARD_WIDTH = 4032;
const BOARD_HEIGHT = 3024;

// Exact circles from your image map.
// Order is important and matches the connection graph below.
const nodes = [
  { x: 1633, y: 581,  r: 138 }, // 0 top
  { x: 2705, y: 648,  r: 132 }, // 1 top-right
  { x: 3251, y: 1110, r: 131 }, // 2 right
  { x: 3325, y: 1923, r: 130 }, // 3 bottom-right
  { x: 2506, y: 2636, r: 135 }, // 4 bottom
  { x: 1263, y: 2508, r: 139 }, // 5 bottom-left
  { x: 732,  y: 1752, r: 132 }, // 6 left
  { x: 935,  y: 1040, r: 132 }, // 7 top-left
  { x: 2064, y: 1519, r: 132 }  // 8 center
];

const connections = {
  0: [1, 7, 8],
  1: [0, 2, 8],
  2: [1, 3, 8],
  3: [2, 4, 8],
  4: [3, 5, 8],
  5: [4, 6, 8],
  6: [5, 7, 8],
  7: [6, 0, 8],
  8: [0, 1, 2, 3, 4, 5, 6, 7]
};

const winningLines = [
  [0, 8, 4],
  [1, 8, 5],
  [2, 8, 6],
  [3, 8, 7]
];

let board = Array(9).fill(null);
let currentPlayer = 1;
let placed = { 1: 0, 2: 0 };
let selected = null;

const game = document.getElementById("game");
const boardImg = document.getElementById("board");
const holesContainer = document.getElementById("holes");
const piecesContainer = document.getElementById("pieces");

function scaleX(x) {
  return (x / BOARD_WIDTH) * game.clientWidth;
}

function scaleY(y) {
  return (y / BOARD_HEIGHT) * game.clientHeight;
}

function scaleR(r) {
  const sx = game.clientWidth / BOARD_WIDTH;
  const sy = game.clientHeight / BOARD_HEIGHT;
  return r * Math.min(sx, sy);
}

function getNodePixel(index) {
  const n = nodes[index];
  return {
    x: scaleX(n.x),
    y: scaleY(n.y)
  };
}

function updatePiecePosition(pieceEl, index) {
  const p = getNodePixel(index);
  pieceEl.style.left = `${p.x}px`;
  pieceEl.style.top = `${p.y}px`;
  pieceEl.dataset.index = String(index);
}

function checkWin(player) {
  return winningLines.some(line => line.every(i => board[i] === player));
}

function clearSelection() {
  document.querySelectorAll(".piece.selected").forEach(el => {
    el.classList.remove("selected");
  });
  selected = null;
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function refreshHoles() {
  document.querySelectorAll(".hole").forEach((holeEl, index) => {
    if (board[index] !== null) {
      holeEl.classList.add("occupied");
    } else {
      holeEl.classList.remove("occupied");
    }
  });
}

function createPiece(player, index) {
  const el = document.createElement("img");
  el.src = player === 1 ? "stone1.png" : "stone2.png";
  el.className = "piece";
  el.dataset.player = String(player);
  el.draggable = false;

  updatePiecePosition(el, index);

  el.addEventListener("click", (event) => {
    event.stopPropagation();

    if (placed[1] < 3 || placed[2] < 3) return;
    if (player !== currentPlayer) return;

    clearSelection();
    el.classList.add("selected");
    selected = {
      el,
      from: Number(el.dataset.index)
    };
  });

  piecesContainer.appendChild(el);
}

function handleHoleClick(index) {
  // Phase 1: placing
  if (placed[currentPlayer] < 3) {
    if (board[index] !== null) return;

    board[index] = currentPlayer;
    createPiece(currentPlayer, index);
    placed[currentPlayer]++;

    refreshHoles();

    if (checkWin(currentPlayer)) {
      setTimeout(() => alert(`Player ${currentPlayer} wins!`), 50);
      return;
    }

    switchPlayer();
    return;
  }

  // Phase 2: moving
  if (!selected) return;
  if (board[index] !== null) return;
  if (!connections[selected.from].includes(index)) return;

  board[selected.from] = null;
  board[index] = currentPlayer;

  updatePiecePosition(selected.el, index);
  selected.el.classList.remove("selected");
  selected = null;

  refreshHoles();

  if (checkWin(currentPlayer)) {
    setTimeout(() => alert(`Player ${currentPlayer} wins!`), 50);
    return;
  }

  switchPlayer();
}

function createHoles() {
  holesContainer.innerHTML = "";

  nodes.forEach((node, index) => {
    const hole = document.createElement("div");
    const x = scaleX(node.x);
    const y = scaleY(node.y);
    const r = scaleR(node.r);

    hole.className = "hole";
    hole.style.left = `${x}px`;
    hole.style.top = `${y}px`;
    hole.style.width = `${r * 2}px`;
    hole.style.height = `${r * 2}px`;

    hole.addEventListener("click", () => handleHoleClick(index));

    holesContainer.appendChild(hole);
  });

  refreshHoles();
}

function repositionPieces() {
  document.querySelectorAll(".piece").forEach(pieceEl => {
    const index = Number(pieceEl.dataset.index);
    updatePiecePosition(pieceEl, index);
  });
}

window.addEventListener("load", () => {
  createHoles();
});

window.addEventListener("resize", () => {
  createHoles();
  repositionPieces();
});
