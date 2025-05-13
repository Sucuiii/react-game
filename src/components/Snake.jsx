// src/components/Snake.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './SnakeGame.module.css';

const CELL_SIZE = 20;
const WIDTH = 30;
const HEIGHT = 15; // 矮一點

const getRandomPosition = () => ({
  x: Math.floor(Math.random() * WIDTH),
  y: Math.floor(Math.random() * HEIGHT),
});

function Snake() {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(getRandomPosition);
  const [gameOver, setGameOver] = useState(false);
  const boardRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (
          newHead.x < 0 || newHead.x >= WIDTH ||
          newHead.y < 0 || newHead.y >= HEIGHT ||
          prev.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomPosition());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  const resetGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setDirection({ x: 1, y: 0 });
    setFood(getRandomPosition());
    setGameOver(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🐍 貪吃蛇</h2>

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
        ref={boardRef}
        className={styles.board}
        style={{
          width: `${WIDTH * CELL_SIZE}px`,
          height: `${HEIGHT * CELL_SIZE}px`,
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
              left: `${segment.x * CELL_SIZE}px`,
              top: `${segment.y * CELL_SIZE}px`,
            }}
          />
        ))}
        <div
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: 'red',
            position: 'absolute',
            left: `${food.x * CELL_SIZE}px`,
            top: `${food.y * CELL_SIZE}px`,
          }}
        />
        {gameOver && (
          <div className={styles.overlay}>
            <p>💀 遊戲結束</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Snake;
