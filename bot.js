"use strict";

/* 
  Implementazione del Bot tramite algoritmo Minimax per Tic Tac Toe.
  La funzione getBotMove(board) analizza la griglia (matrice 3x3) e restituisce
  l’oggetto {row, col} contenente la mossa ottimale per il BOT (simbolo O, valore 2).
  Le celle vuote sono rappresentate da 0, il giocatore da 1.
*/

// Restituisce l’elenco delle mosse disponibili
function getAvailableMoves(board) {
  let moves = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === 0) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

// Controlla se un giocatore ha vinto sulla griglia
function checkWinnerMinimax(board) {
  // Righe
  for (let r = 0; r < 3; r++) {
    if (board[r][0] !== 0 && board[r][0] === board[r][1] && board[r][1] === board[r][2]) {
      return board[r][0];
    }
  }
  // Colonne
  for (let c = 0; c < 3; c++) {
    if (board[0][c] !== 0 && board[0][c] === board[1][c] && board[1][c] === board[2][c]) {
      return board[0][c];
    }
  }
  // Diagonali
  if (board[0][0] !== 0 && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0];
  }
  if (board[0][2] !== 0 && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2];
  }
  return null;
}

// Verifica se la board è completa
function isBoardFull(board) {
  return getAvailableMoves(board).length === 0;
}

// Valuta lo stato terminale della board e restituisce un punteggio
// Se il BOT (2) ha vinto restituisce 10 - depth, se il giocatore (1) ha vinto restituisce depth - 10, altrimenti 0.
function evaluate(board, depth) {
  let winner = checkWinnerMinimax(board);
  if (winner === BOT_PIECE) return 10 - depth;
  else if (winner === PLAYER_PIECE) return depth - 10;
  else return 0;
}

// Algoritmo minimax
function minimax(board, depth, isMaximizing) {
  let winner = checkWinnerMinimax(board);
  if (winner !== null || isBoardFull(board)) {
    return { score: evaluate(board, depth) };
  }
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = null;
    let moves = getAvailableMoves(board);
    for (let move of moves) {
      board[move.row][move.col] = BOT_PIECE; // Il BOT fa la mossa
      let result = minimax(board, depth + 1, false);
      board[move.row][move.col] = 0;
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, row: bestMove.row, col: bestMove.col };
  } else {
    let bestScore = Infinity;
    let bestMove = null;
    let moves = getAvailableMoves(board);
    for (let move of moves) {
      board[move.row][move.col] = PLAYER_PIECE; // Il giocatore fa la mossa
      let result = minimax(board, depth + 1, true);
      board[move.row][move.col] = 0;
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, row: bestMove.row, col: bestMove.col };
  }
}

// Funzione principale che restituisce la mossa ottimale per il BOT
function getBotMove(board) {
  let bestMove = minimax(board, 0, true);
  return { row: bestMove.row, col: bestMove.col };
}
