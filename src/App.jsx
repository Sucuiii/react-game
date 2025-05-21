// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'; // 確保你的 App.css 檔案存在

import Result from './components/Result';
import NicknameInput from './components/NicknameInput';
import Leaderboard from './components/Leaderboard';
import Minesweeper from './components/Minesweeper';
import Snake from './components/Snake';
import WhacAMole from './components/WhacAMole'; // 確保這個檔案名和匯出名稱一致

import { getPlayerName, saveHighScore } from './utils/localStorageUtils';

// 引入圖片資產，請確保這些路徑是正確的
import mine from './assets/mine.png'; // 假設你有 mine.png 在 assets 資料夾
import snake from './assets/snake.png'; // 假設你有 snake.png 在 assets 資料夾
import mice from './assets/mice.png'; // 假設你有 mice.png 在 assets 資料夾

function App() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(''); // playerName 狀態，用於顯示歡迎訊息

  // 應用程式啟動時檢查 localStorage 中是否有玩家名稱
  useEffect(() => {
    const storedName = getPlayerName();
    if (storedName) {
      setPlayerName(storedName);
      // 如果有儲存的名稱，且目前在根路徑，則導航到 /home 遊戲大廳
      if (window.location.pathname === '/') {
        navigate('/home');
      }
    }
  }, [navigate]); // navigate 應該作為依賴項

  // 當暱稱設定完成時被調用，更新 playerName 狀態並導航到 /home
  const handleNicknameSet = (name) => {
    setPlayerName(name);
    // saveHighScore 內部會處理 setPlayerName
    navigate('/home');
  };

  // 處理遊戲結束的通用函式
  // 接收遊戲名稱和分數，保存分數並導航到結果頁
  const handleGameEnd = (gameName, score) => {
    const currentName = getPlayerName(); // 獲取當前玩家名稱
    // 只有當有玩家名稱且分數大於 0 時才保存分數
    // (你可以根據需求調整分數保存的條件)
    if (currentName) { // 即使分數為0，也可能希望保存記錄
      saveHighScore(gameName, currentName, score);
    }

    // 導航到結果頁，並將 playerName, score, gameName 作為 state 傳遞
    navigate('/result', {
      state: {
        playerName: currentName || '匿名玩家', // 如果沒有名稱，使用匿名玩家
        score: score,
        gameName: gameName,
      },
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <Routes>
        {/* 根路徑 '/' 對應到暱稱輸入頁面 */}
        <Route
          path="/"
          element={<NicknameInput onNicknameSet={handleNicknameSet} />}
        />

        {/* 結果頁面 */}
        <Route path="/result" element={<Result />} />

        {/* 遊戲大廳頁面 */}
        <Route
          path="/home"
          element={
            <>
              <h1 style={{ marginBottom: '40px' }}>🎮 小遊戲大廳</h1>
              {/* 如果 playerName 存在，顯示歡迎訊息 */}
              {playerName && <h2 style={{ marginBottom: '20px' }}>歡迎回來，{playerName}！</h2>}

              {/* 遊戲卡片列表 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '100px', flexWrap: 'wrap' }}>
                <GameCard to="/minesweeper" img={mine} title="踩地雷" />
                <GameCard to="/snake" img={snake} title="貪吃蛇" />
                <GameCard to="/whac-a-mole" img={mice} title="打 IU" />
              </div>

              {/* 各遊戲的排行榜 */}
              <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <Leaderboard gameName="踩地雷" />
                <Leaderboard gameName="貪吃蛇" />
                <Leaderboard gameName="打 IU" />
              </div>
            </>
          }
        />

        {/* 遊戲頁面路由 */}
        <Route
          path="/minesweeper"
          // 踩地雷遊戲現在由其內部自行處理導航和分數保存，
          // 但為了統一 handleGameEnd 的調用方式，我們仍然傳遞一個包裝函式。
          // 這樣 Minesweeper 內部可以呼叫 onGameEnd(finalScore)
          // 然後這裡將分數和遊戲名稱傳遞給 App 的 handleGameEnd。
          // 注意：如果 Minesweeper 內部已經自行導航，這裡的 onGameEnd 可能不會被觸發，
          // 但作為統一接口，傳遞是安全的。
          element={<Minesweeper onGameEnd={(score) => handleGameEnd('踩地雷', score)} />}
        />
        <Route
          path="/snake"
          element={<Snake onGameEnd={(score) => handleGameEnd('貪吃蛇', score)} />}
        />
        <Route
          path="/whac-a-mole"
          element={<WhacAMole onGameEnd={(score) => handleGameEnd('打 IU', score)} />}
        />
      </Routes>
    </div>
  );
}

// 小遊戲卡片元件
function GameCard({ to, img, title }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ width: '250px' }}>
        <img
          src={img}
          alt={title}
          style={{
            width: '100%',
            height: '175px',
            objectFit: 'cover',
            borderRadius: '12px',
            marginBottom: '12px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        />
        <button style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#4CAF50',
          color: 'white',
          cursor: 'pointer',
          marginTop: '10px'
        }}>
          {title}
        </button>
      </div>
    </Link>
  );
}

export default App;