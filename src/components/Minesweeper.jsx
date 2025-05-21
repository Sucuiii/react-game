import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Minesweeper.module.css';
import { getPlayerName, saveHighScore } from '../utils/localStorageUtils'; // 引入分數儲存工具

const ROWS = 8;
const COLS = 15;
const BOMBS = 20;
const DELAY_BEFORE_NAVIGATE = 2000; // 2秒延遲

// 輔助函式：生成初始棋盤
function generateBoard() {
  const board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ revealed: false, bomb: false, count: 0, flagged: false })) // 加上 flagged 狀態
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
  const navigate = useNavigate();

  const [board, setBoard] = useState(() => generateBoard()); // 使用函式初始化 state
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false); // 新增遊戲勝利狀態
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [explodedCell, setExplodedCell] = useState(null);
  const [minesFlagged, setMinesFlagged] = useState(0); // 記錄標記的炸彈數量
  const [showAllBombs, setShowAllBombs] = useState(false); // 新增狀態：是否顯示所有炸彈

  // 防止重複跳轉的 useRef
  const hasNavigated = useRef(false);
  // 用於清除延遲跳轉的計時器
  const navigationTimeoutRef = useRef(null);

  // 炸彈音效
  const explosionSound = useRef(new Audio('/sound/explosion.m4a'));

  // 計時器邏輯
  useEffect(() => {
    let interval;
    if (timerRunning && !gameOver && !gameWon) { // 只有在計時器運行，遊戲未結束，且未勝利時才計時
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, gameOver, gameWon]); // 增加 gameWon 作為依賴項

  // 處理遊戲結束（勝利或失敗）後的延遲跳轉
  useEffect(() => {
    if (gameOver && !hasNavigated.current) {
      // 遊戲結束時，顯示所有炸彈
      setShowAllBombs(true);
      setTimerRunning(false); // 停止計時

      // 清除之前的計時器，避免重複觸發
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      navigationTimeoutRef.current = setTimeout(() => {
        // 在延遲期間，如果已經導航，則不再執行
        if (hasNavigated.current) return;
        hasNavigated.current = true; // 標記已跳轉

        const playerName = getPlayerName() || '匿名玩家';
        const finalScore = gameWon ? Math.max(1, 10000 - time) : 0;
        saveHighScore('踩地雷', playerName, finalScore); // 保存分數

        navigate('/result', {
          state: { playerName: playerName, score: finalScore, gameName: '踩地雷' },
        });
        setShowAllBombs(false); // 跳轉後隱藏炸彈（雖然組件會卸載）
      }, DELAY_BEFORE_NAVIGATE);
    }
    // 清理函數：組件卸載或 gameOver 狀態改變時清除計時器
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [gameOver, gameWon, time, navigate]); // 依賴 gameOver, gameWon, time, navigate

  // 檢查遊戲勝利條件
  useEffect(() => {
    if (gameOver) return; // 如果遊戲已經結束，不再檢查勝利條件

    let unrevealedCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].revealed) unrevealedCount++;
      }
    }

    if (unrevealedCount === BOMBS) { // 勝利條件：所有非炸彈的格子都被揭露
      setGameWon(true); // 設定勝利狀態
      setGameOver(true); // 設定遊戲結束，這會觸發上面的 useEffect 處理延遲跳轉
    }
  }, [board, gameOver]); // 增加 gameOver 作為依賴，避免在遊戲結束後重複觸發

  // 遞迴揭露空白格子的函式
  const revealEmptyCells = useCallback((r, c, currentBoard) => {
    if (
      r < 0 || r >= ROWS ||
      c < 0 || c >= COLS ||
      currentBoard[r][c].revealed ||
      currentBoard[r][c].bomb ||
      currentBoard[r][c].flagged // 避免揭露已標記的格子
    ) {
      return currentBoard;
    }

    currentBoard[r][c].revealed = true;

    if (currentBoard[r][c].count === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          revealEmptyCells(r + i, c + j, currentBoard);
        }
      }
    }
    return currentBoard;
  }, []); // 空依賴，只創建一次

  const revealCell = (r, c) => {
    if (gameOver || board[r][c].revealed || board[r][c].flagged) return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));

    if (newBoard[r][c].bomb) {
      // 踩到炸彈，遊戲結束
      setExplodedCell({ r, c });
      setGameOver(true); // 這會觸發上面的 useEffect 處理延遲跳轉和顯示炸彈
      setGameWon(false); // 確保設定為未勝利
      explosionSound.current.play(); // 播放炸彈音效
    } else {
      // 如果是數字格或空白格
      if (newBoard[r][c].count === 0) {
        setBoard(revealEmptyCells(r, c, newBoard)); // 遞迴揭露
      } else {
        newBoard[r][c].revealed = true;
        setBoard(newBoard);
      }
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault(); // 阻止右鍵預設選單
    if (gameOver || board[r][c].revealed) return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;

    // 更新標記的炸彈數量
    setMinesFlagged(newBoard.flat().filter(cell => cell.flagged).length);
    setBoard(newBoard);
  };

  const resetGame = () => {
    // 清除任何待處理的計時器
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    setBoard(generateBoard());
    setGameOver(false);
    setGameWon(false); // 重置勝利狀態
    setTime(0);
    setTimerRunning(true);
    setExplodedCell(null);
    setMinesFlagged(0); // 重置標記數量
    hasNavigated.current = false; // 重置導航標誌
    setShowAllBombs(false); // 重置顯示所有炸彈的狀態
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>⛳ 踩地雷</h2>
      <p className={styles.timer}>⏱️ 時間：{time} 秒</p>
      <p className={styles.bombsLeft}>🚩 炸彈數：{BOMBS - minesFlagged}</p> {/* 顯示剩餘炸彈數 */}

      {/* 返回遊戲天堂按鈕，點擊後跳轉到 Result 頁面並分數為 0 */}
      <button
        onClick={() => {
          // 清除任何待處理的計時器
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
          }
          const playerName = getPlayerName() || '匿名玩家';
          saveHighScore('踩地雷', playerName, 0); // 中途退出，分數為 0
          navigate('/result', { state: { playerName: playerName, score: 0, gameName: '踩地雷' } });
        }}
        style={{
          display: 'inline-block',
          marginBottom: '10px',
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        🔙 返回遊戲天堂
      </button>

      <button onClick={resetGame} className={styles.button}>重新開始</button>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${COLS}, 30px)` }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isExplodedCell = explodedCell && explodedCell.r === r && explodedCell.c === c;

            let cellClass = styles.hidden;
            let cellContent = null;

            // 判斷是否顯示所有炸彈：
            // 1. 如果格子已經被揭露
            // 2. 或者遊戲結束且設定為顯示所有炸彈，並且該格子是炸彈
            if (cell.revealed || (gameOver && showAllBombs && cell.bomb)) {
              if (cell.bomb) {
                cellClass = styles.bomb;
                cellContent = isExplodedCell ? (
                  <img src="/src/assets/explosion.png" alt="Boom" width={24} />
                ) : (
                  '💣'
                );
              } else {
                cellClass = styles.revealed;
                cellContent = cell.count || '';
              }
            } else {
              if (cell.flagged) {
                cellContent = '🚩';
              }
            }

            if (isExplodedCell) {
              cellClass += ` ${styles.exploded}`;
            }

            return (
              <button
                key={`${r}-${c}`}
                className={`${styles.cell} ${cellClass}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                disabled={gameOver} // 遊戲結束時禁用所有按鈕
              >
                {cellContent}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Minesweeper;
