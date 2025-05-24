"use strict";

// COSTANTI DI GIOCO
const BOARD_SIZE = 3; // Griglia 3x3
const CELL_SIZE = 100; // Dimensione in pixel di ogni cella (su un canvas di 300x300)
const PLAYER_PIECE = 1; // Giocatore (simbolo "X")
const BOT_PIECE = 2;    // Bot (simbolo "O")

// Recupera gli elementi dal DOM
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let homeScreen = document.getElementById("homeScreen");
let gameInfo = document.getElementById("gameInfo");
let turnDisplay = document.getElementById("turnDisplay");
let statusDisplay = document.getElementById("statusDisplay");

let startBtn = document.getElementById("startBtn");
let recordBtn = document.getElementById("recordBtn");
let playerNameInput = document.getElementById("playerName");

// Stato del gioco
let board = [];
let gameRunning = false;
let currentTurn = "player"; // "player" oppure "bot"
let moveCount = 0;
let playerName = "";

// Inizializza la griglia (board) come matrice 3x3
function initBoard() {
  board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    let row = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      row.push(0);
    }
    board.push(row);
  }
}

// Disegna il tabellone (griglia e mosse)
function drawBoard() {
  // Pulisci il canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Disegna la griglia: due linee verticali e due orizzontali
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  for (let i = 1; i < BOARD_SIZE; i++) {
    // Linee verticali
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();
    ctx.closePath();
    
    // Linee orizzontali
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
    ctx.closePath();
  }
  
  // Disegna le mosse (X e O)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      let cell = board[r][c];
      if (cell !== 0) {
        let centerX = c * CELL_SIZE + CELL_SIZE / 2;
        let centerY = r * CELL_SIZE + CELL_SIZE / 2;
        if (cell === PLAYER_PIECE) {
          // Disegna "X"
          ctx.strokeStyle = "red";
          ctx.lineWidth = 4;
          let offset = 20;
          ctx.beginPath();
          ctx.moveTo(c * CELL_SIZE + offset, r * CELL_SIZE + offset);
          ctx.lineTo((c + 1) * CELL_SIZE - offset, (r + 1) * CELL_SIZE - offset);
          ctx.moveTo((c + 1) * CELL_SIZE - offset, r * CELL_SIZE + offset);
          ctx.lineTo(c * CELL_SIZE + offset, (r + 1) * CELL_SIZE - offset);
          ctx.stroke();
          ctx.closePath();
        } else if (cell === BOT_PIECE) {
          // Disegna "O"
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(centerX, centerY, CELL_SIZE / 2 - 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  }
}

// Controlla se una determinata mossa ha prodotto la vittoria
function checkWin(piece) {
  // Controllo righe
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r][0] === piece && board[r][1] === piece && board[r][2] === piece) {
      return true;
    }
  }
  // Controllo colonne
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board[0][c] === piece && board[1][c] === piece && board[2][c] === piece) {
      return true;
    }
  }
  // Controllo diagonali
  if (board[0][0] === piece && board[1][1] === piece && board[2][2] === piece) {
    return true;
  }
  if (board[0][2] === piece && board[1][1] === piece && board[2][0] === piece) {
    return true;
  }
  return false;
}

// Verifica se il tabellone è pieno (pareggio)
function isBoardFull() {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

// Gestione del click: il giocatore effettua una mossa
canvas.addEventListener("click", function(e) {
  if (!gameRunning || currentTurn !== "player") return;
  
  let rect = canvas.getBoundingClientRect();
  let clickX = e.clientX - rect.left;
  let clickY = e.clientY - rect.top;
  
  // Calcola la cella cliccata
  let col = Math.floor(clickX / CELL_SIZE);
  let row = Math.floor(clickY / CELL_SIZE);
  
  // Se la cella è vuota, esegue la mossa
  if (board[row][col] === 0) {
    board[row][col] = PLAYER_PIECE;
    moveCount++;
    drawBoard();
    
    // Controlla se il giocatore ha vinto
    if (checkWin(PLAYER_PIECE)) {
      gameOver("VINCI", playerName);
      return;
    }
    
    // Pareggio?
    if (isBoardFull()) {
      gameOver("PAREGGIO", "Nessuno");
      return;
    }
    
    // Passa il turno al Bot
    currentTurn = "bot";
    updateTurnDisplay();
    setTimeout(botTurn, 300);
  }
});

// Il turno del Bot (usa la funzione getBotMove definita in bot.js)
function botTurn() {
  if (!gameRunning) return;
  
  // getBotMove restituisce {row, col} utilizzando minimax per trovare la mossa ottimale
  let move = getBotMove(board);
  if (move) {
    board[move.row][move.col] = BOT_PIECE;
    moveCount++;
    drawBoard();
    
    if (checkWin(BOT_PIECE)) {
      gameOver("PERSO", "BOT");
      return;
    }
    
    if (isBoardFull()) {
      gameOver("PAREGGIO", "Nessuno");
      return;
    }
    
    // Ritorna il turno al giocatore
    currentTurn = "player";
    updateTurnDisplay();
  }
}

// Aggiorna il display del turno
function updateTurnDisplay() {
  if (currentTurn === "player")
    turnDisplay.innerText = "Turno: " + playerName;
  else
    turnDisplay.innerText = "Turno: BOT";
}

// Gestisce la fine partita, invia il record al server e resetta il gioco
function gameOver(result, winner) {
  gameRunning = false;
  let recordEntry = {
    name: playerName,
    result: result, // "VINCI", "PERSO" o "PAREGGIO"
    moves: moveCount,
    winner: winner,
    date: new Date().toLocaleString()
  };
  
  // Invia il record al backend PHP (record.php)
  $.ajax({
    url: "record.php",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(recordEntry)
  })
  .done(function(response) {
    console.log("Record salvato:", response);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Errore nel salvataggio del record:", textStatus, errorThrown);
  });
  
  let message = "";
  if (result === "VINCI") {
    message = "Complimenti " + playerName + "! Hai vinto in " + moveCount + " mosse.";
  } else if (result === "PERSO") {
    message = "Peccato " + playerName + ", il BOT ha vinto in " + moveCount + " mosse.";
  } else {
    message = "Il gioco è finito in pareggio dopo " + moveCount + " mosse.";
  }
  
  // Ritarda di 1 secondo la visualizzazione dell'esito per permettere di vedere l'ultima mossa vincente
  setTimeout(function(){
      alert("Game Over! " + message);
      resetGame();
  }, 1000);
}

// Resetta il gioco e torna alla schermata iniziale
function resetGame() {
  initBoard();
  moveCount = 0;
  currentTurn = "player";
  updateTurnDisplay();
  drawBoard();
  homeScreen.style.display = "block";
  gameInfo.classList.add("hidden");
  canvas.classList.add("hidden");
}

// Avvia la partita: controlla il nome, mostra il canvas, e inizializza la partita
function startGame() {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    alert("Inserisci il tuo nome per iniziare la partita.");
    return;
  }
  homeScreen.style.display = "none";
  gameInfo.classList.remove("hidden");
  canvas.classList.remove("hidden");
  initBoard();
  moveCount = 0;
  currentTurn = "player";
  updateTurnDisplay();
  drawBoard();
  gameRunning = true;
}

// Carica i record dal server (attraverso record.php)
function loadRecords() {
  $.ajax({
    url: "record.php",
    method: "GET",
    dataType: "json"
  })
  .done(function(data) {
    let recordList = $("#recordList");
    recordList.empty();
    // Ordina i record per numero di mosse (minore è migliore)
    data.sort((a, b) => a.moves - b.moves);
    data.forEach(function(record) {
      let li = $("<li>")
                  .addClass("list-group-item bg-dark text-white")
                  .text(record.name + " - " + record.result + " (Mosse: " + record.moves + ") - Vincitore: " + record.winner + " - " + record.date);
      recordList.append(li);
    });
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Errore nel caricamento dei record:", textStatus, errorThrown);
  });
}

// Mostra il modal dei record
function showRecords() {
  loadRecords();
  $("#recordModal").modal("show");
}

// Binding dei pulsanti
startBtn.addEventListener("click", startGame);
recordBtn.addEventListener("click", showRecords);
