import React, { useState, useEffect, useRef } from 'react';
import styles from './SnakeGame.module.css';

const CELL_SIZE = 20;
const WIDTH = 30;
const HEIGHT = 15;
const GAME_SPEED = 150;

const getRandomPosition = (excludePositions = []) => {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * WIDTH),
      y: Math.floor(Math.random() * HEIGHT),
    };
  } while (excludePositions.some(pos => pos.x === position.x && pos.y === position.y));
  return position;
};

function Snake({ onGameEnd }) { // 接收 onGameEnd prop
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(() => getRandomPosition());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const directionRef = useRef(direction);
  const onGameEndRef = useRef(onGameEnd); // 使用 useRef 確保 onGameEnd 是最新的

  // 貪吃蛇背景音樂
  const backgroundMusic = useRef(new Audio('/sound/snake-bg.m4a'));

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

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

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };

        // 撞牆或撞自己
        if (
          newHead.x < 0 || newHead.x >= WIDTH ||
          newHead.y < 0 || newHead.y >= HEIGHT ||
          prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          onGameEndRef.current(score, '貪吃蛇'); // 遊戲結束，傳遞分數和遊戲名稱
          return prev;
        }

        const ateFood = (newHead.x === food.x && newHead.y === food.y);
        const newSnake = [newHead, ...prev];

        if (ateFood) {
          setScore(prevScore => prevScore + 1);
          setFood(getRandomPosition(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(interval);
  }, [food, gameOver, gameStarted, score]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || !gameStarted) return; // 遊戲未開始或結束時不響應按鍵

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameStarted]); // 增加 gameStarted 作為依賴

  const resetGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setDirection({ x: 1, y: 0 });
    setFood(getRandomPosition());
    setGameOver(false);
    setScore(0);
    setGameStarted(false); // 重置時設定為未開始狀態，讓開始按鈕顯示
  };

  const startGame = () => {
    resetGame(); // 開始遊戲前先重置
    setGameStarted(true);
  };

  const backToHome = () => {
    resetGame();
    setGameStarted(false);
    onGameEndRef.current(0, '貪吃蛇'); // 中途返回分數歸零
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🐍 貪吃蛇</h2>
      <p className={styles.score}>分數: {score}</p>

      <button
        onClick={backToHome}
        style={{
          display: 'inline-block',
          marginBottom: '10px',
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        🔙 返回遊戲天堂
      </button>

      {!gameStarted && !gameOver && (
        <button onClick={startGame} className={styles.button}>開始遊戲</button>
      )}
      {(gameStarted && !gameOver) && (
        <button onClick={resetGame} className={styles.button}>重新開始</button>
      )}

      <div
        className={styles.board}
        style={{
          width: WIDTH * CELL_SIZE,
          height: HEIGHT * CELL_SIZE,
          position: 'relative',
          margin: '20px auto',
          border: '2px solid black',
          backgroundColor: '#eee',
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: 'green',
              position: 'absolute',
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
            }}
          />
        ))}
        <div
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: 'red',
            position: 'absolute',
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        />
        {gameOver && (
          <div className={styles.overlay}>
            <p>💀 遊戲結束！你的分數是: {score}</p>
            <button onClick={startGame} className={styles.button}>再玩一次</button>
            <button
              onClick={() => onGameEndRef.current(score, '貪吃蛇')} // 遊戲結束彈窗的「回到遊戲天堂」
              className={styles.button}
              style={{ marginLeft: 10 }}
            >
              回到遊戲天堂
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Snake;
