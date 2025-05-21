// src/components/Result.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  // 從跳轉的 state 拿資料，防呆加空物件
  const { playerName, score, gameName } = location.state || {};

  // 回到遊戲大廳（首頁）
  const handleBack = () => {
    navigate('/'); // 這裡改成你遊戲大廳的路徑，假設是 '/'
  };

  // 如果拿不到必要資料，直接告訴玩家要重新開始
  if (!playerName || score === undefined || !gameName) { // 增加了 !gameName 檢查
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>資料遺失，請重新開始遊戲。</h2>
        <button onClick={handleBack} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
          回到遊戲大廳
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>🎉 遊戲結束！</h1>
      <h2>{playerName} 的成績：</h2>
      <p style={{ fontSize: '28px', marginBottom: '20px' }}>遊戲：{gameName}</p>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4CAF50' }}>{score} 分</p>
      <button
        onClick={handleBack}
        style={{ marginTop: '30px', padding: '12px 24px', fontSize: '18px', cursor: 'pointer' }}
      >
        回到遊戲大廳
      </button>
    </div>
  );
}

export default Result;