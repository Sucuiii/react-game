// src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { getHighScores } from '../utils/localStorageUtils';

const Leaderboard = ({ gameName }) => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        // 當 gameName 改變時，重新載入排行榜數據
        setScores(getHighScores(gameName));
    }, [gameName]);

    return (
        <div className="leaderboard-container">
            <h3>{gameName} 排行榜</h3>
            {scores.length === 0 ? (
                <p>目前沒有紀錄。</p>
            ) : (
                <ol>
                    {scores.map((entry, index) => (
                        <li key={index}>
                            **{entry.name}**: {entry.score} 分
                            <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                                ({new Date(entry.date).toLocaleString()})
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default Leaderboard;