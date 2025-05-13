// src/components/Minesweeper.jsx
import React, { useState, useEffect } from 'react';
import styles from './Minesweeper.module.css';
import { Link } from 'react-router-dom';

const ROWS = 8;
const COLS = 15;
const BOMBS = 20;

function generateBoard() {
  const board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ revealed: false, bomb: false, count: 0 }))
  );

  // 隨機放置炸彈
  let bombsPlaced = 0;
  while (bombsPlaced < BOMBS) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);
    if (!board[row][col].bomb) {
      board[row][col].bomb = true;
      bombsPlaced++;
    }
  }

  // 計算每格周圍炸彈數量
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].bomb) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const nr = r + i, nc = c + j;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].bomb) {
              count++;
            }
          }
        }
        board[r][c].count = count;
      }
    }
  }

  return board;
}

function Minesweeper() {
  const [board, setBoard] = useState(generateBoard);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  useEffect(() => {
    if (timerRunning && !gameOver) {
      const interval = setInterval(() => setTime((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerRunning, gameOver]);

  const reveal = (r, c) => {
    if (gameOver || board[r][c].revealed) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].revealed = true;
    if (newBoard[r][c].bomb) {
      setGameOver(true);
      setTimerRunning(false);
      alert('💣 Boom! 遊戲結束');
    }
    setBoard(newBoard);
  };

  const resetGame = () => {
    setBoard(generateBoard());
    setGameOver(false);
    setTime(0);
    setTimerRunning(true);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>⛳ 踩地雷</h2>
      <p className={styles.timer}>⏱️ 時間：{time} 秒</p>

      {/* ⬅️ 這裡加上返回首頁按鈕 */}
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginBottom: '10px',
          padding: '6px 12px',
          backgroundColor: '#4caf50',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px'
        }}
      >
        🔙 返回首頁
      </Link>

      <button onClick={resetGame} className={styles.button}>重新開始</button>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${COLS}, 30px)` }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              className={`${styles.cell} ${
                cell.revealed
                  ? cell.bomb
                    ? styles.bomb
                    : styles.revealed
                  : styles.hidden
              }`}
              onClick={() => reveal(r, c)}
            >
              {cell.revealed ? (cell.bomb ? '💣' : (cell.count || '')) : ''}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default Minesweeper;
