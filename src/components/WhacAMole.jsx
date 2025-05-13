import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ← 加這行！
import iuImg from '../assets/iu.png';
import styles from './WhackIU.module.css';

function WhackIU() {
  const [score, setScore] = useState(0);
  const [moleIndex, setMoleIndex] = useState(null);
  const [missCount, setMissCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (moleIndex !== null) {
        setMissCount(prev => {
          const newMiss = prev + 1;
          if (newMiss >= 5) {
            setGameOver(true);
            clearInterval(interval);
          }
          return newMiss;
        });
      }

      setMoleIndex(Math.floor(Math.random() * 9));
    }, 1000);

    return () => clearInterval(interval);
  }, [moleIndex, gameOver]);

  const handleClick = (index) => {
    if (gameOver) return;

    if (index === moleIndex) {
      setScore(score + 1);
      setMoleIndex(null);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>打 IU 😍</h2>
      {gameOver ? (
        <>
          <p className={styles.gameOverText}>你錯過 IU 太多次了 💔</p>
          <p className={styles.scoreboard}>最終分數：{score}</p>
          <Link to="/" className={styles.gameOverButton}>回首頁</Link>
        </>
      ) : (
        <>
          <p className={styles.scoreboard}>分數：{score}</p>
          <p className={styles.missCount}>未命中次數：{missCount} / 5</p>
          <div className={styles.grid}>
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                onClick={() => handleClick(index)}
                className={`${styles.cell} ${index === moleIndex ? styles.active : ''}`}
              >
                {index === moleIndex && (
                  <img src={iuImg} alt="IU" />
                )}
              </div>
            ))}
          </div>
          <Link to="/" className={styles.restartButton} style={{ marginTop: '20px' }}>
            回首頁
          </Link>
        </>
      )}
    </div>
  );
}

export default WhackIU;
