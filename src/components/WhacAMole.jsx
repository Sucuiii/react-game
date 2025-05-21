import React, { useState, useEffect, useRef } from 'react';
import iuImg from '../assets/iu.png'; // 確認路徑
import styles from './WhackIU.module.css'; // 樣式檔名維持原樣，或也可改名

const GAME_DURATION = 30000; // 30秒
const MOLE_APPEAR_INTERVAL = 1000; // 1秒

function WhacAMole({ onGameEnd }) { // 接收 onGameEnd prop
  const [score, setScore] = useState(0);
  const [moleIndex, setMoleIndex] = useState(null);
  const [missCount, setMissCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);

  const timerRef = useRef(null); // 地鼠出現計時器
  const gameTimerRef = useRef(null); // 遊戲總時長計時器
  const onGameEndRef = useRef(onGameEnd); // 使用 useRef 確保 onGameEnd 是最新的

  // 音效 useRef
  const hitSound = useRef(new Audio('/sound/hit.m4a'));
  const backgroundMusic = useRef(new Audio('/sound/whack-bg.m4a'));

  useEffect(() => {
    onGameEndRef.current = onGameEnd;
  }, [onGameEnd]);

  // 控制背景音樂的播放和暫停
  useEffect(() => {
    backgroundMusic.current.loop = true; // 設定音樂循環播放
    if (gameStarted && !gameOver) {
      backgroundMusic.current.play().catch(e => console.error("Error playing background music:", e));
    } else {
      backgroundMusic.current.pause();
      backgroundMusic.current.currentTime = 0; // 重置音樂到開頭
    }
    // 清理函數：組件卸載時暫停音樂
    return () => {
      backgroundMusic.current.pause();
      backgroundMusic.current.currentTime = 0;
    };
  }, [gameStarted, gameOver]); // 依賴 gameStarted 和 gameOver 狀態

  // 遊戲總時長計時器和遊戲結束處理
  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { // 時間到
            clearInterval(gameTimerRef.current);
            setGameOver(true); // 設定遊戲結束
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(gameTimerRef.current);
    } else if (gameOver) {
      // 遊戲結束時（無論是時間到還是未命中過多）
      clearInterval(timerRef.current); // 停止地鼠出現計時器
      clearInterval(gameTimerRef.current); // 停止遊戲總時長計時器
      timerRef.current = null;
      gameTimerRef.current = null;
      onGameEndRef.current(score, '打地鼠'); // 遊戲結束，傳遞最終分數和遊戲名稱
    }
  }, [gameStarted, gameOver, score]);

  // 地鼠出現邏輯及未命中處理
  useEffect(() => {
    if (gameOver || !gameStarted) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      if (moleIndex !== null) { // 如果上一隻地鼠還沒被擊中
        setMissCount(prev => {
          const newMissCount = prev + 1;
          if (newMissCount >= 5) { // 未命中次數達到上限
            setGameOver(true);
            return prev; // 保持在 4，因為達到 5 會導致遊戲結束
          }
          return newMissCount;
        });
      }
      setMoleIndex(Math.floor(Math.random() * 9)); // 隨機出現地鼠
    }, MOLE_APPEAR_INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [moleIndex, gameOver, gameStarted]); // 依賴項是正確的

  const handleClick = (index) => {
    if (gameOver || !gameStarted) return; // 遊戲結束或未開始時禁用點擊
    if (index === moleIndex) {
      setScore(prev => prev + 1);
      setMoleIndex(null); // 擊中後隱藏地鼠
      hitSound.current.play().catch(e => console.error("Error playing hit sound:", e)); // 播放擊中音效
    }
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    clearInterval(gameTimerRef.current);
    timerRef.current = null;
    gameTimerRef.current = null;

    setScore(0);
    setMoleIndex(null);
    setMissCount(0);
    setGameOver(false);
    setGameStarted(false);
    setTimeLeft(GAME_DURATION / 1000);
  };

  const startGame = () => {
    resetGame(); // 開始遊戲前先重置
    setGameStarted(true);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>打 IU 😍</h2>
      <p className={styles.timer}>時間: {timeLeft} 秒</p>

      {/* 返回遊戲天堂按鈕 */}
      <button
        onClick={() => {
          resetGame(); // 返回前重置遊戲狀態
          onGameEndRef.current(0, '打地鼠'); // 中途返回，分數為 0
        }}
        style={{
          marginBottom: 10,
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: '#fff',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          marginRight: 10,
        }}
      >
        🔙 返回遊戲天堂
      </button>

      {!gameStarted && !gameOver ? (
        <button onClick={startGame} className={styles.button}>開始遊戲</button>
      ) : (gameStarted && !gameOver) && (
        <button onClick={resetGame} className={styles.button}>重新開始</button>
      )}

      {gameOver ? (
        <div className={styles.overlay}>
          <p className={styles.gameOverText}>遊戲結束！</p>
          <p className={styles.scoreboard}>最終分數：{score}</p>
          <button onClick={resetGame} className={styles.button}>再玩一次</button>
          <button
            onClick={() => onGameEndRef.current(score, '打地鼠')} // 遊戲結束彈窗的「回到遊戲天堂」
            className={styles.button}
            style={{ marginLeft: 10 }}
          >
            回到遊戲天堂
          </button>
        </div>
      ) : (
        <>
          <p className={styles.scoreboard}>分數：{score}</p>
          <p className={styles.missCount}>未命中次數：{missCount} / 5</p>
          <div className={styles.grid}>
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                onClick={() => handleClick(index)}
                className={`${styles.cell} ${gameStarted && index === moleIndex ? styles.active : ''}`}
              >
                {gameStarted && index === moleIndex && (
                  <img src={iuImg} alt="IU" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default WhacAMole;
