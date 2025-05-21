// src/components/NicknameInput.jsx
import React, { useState, useEffect } from 'react';
import { getPlayerName, setPlayerName } from '../utils/localStorageUtils';

const NicknameInput = ({ onNicknameSet }) => {
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        const storedName = getPlayerName();
        if (storedName) {
            setNickname(storedName);
            onNicknameSet(storedName); // 如果已有暱稱，直接回調父組件
        }
    }, [onNicknameSet]);

    const handleChange = (e) => {
        setNickname(e.target.value);
    };

    const handleSubmit = () => {
        if (nickname.trim()) {
            setPlayerName(nickname.trim());
            onNicknameSet(nickname.trim());
        } else {
            alert('請輸入您的暱稱！');
        }
    };

    return (
        <div className="nickname-input-container">
            <h1>歡迎來到遊戲天堂！</h1>
            {!getPlayerName() ? ( // 如果還沒有暱稱才顯示輸入框
                <>
                    <p>請輸入您的暱稱：</p>
                    <input
                        type="text"
                        value={nickname}
                        onChange={handleChange}
                        placeholder="你的暱稱"
                        maxLength="15"
                    />
                    <button onClick={handleSubmit}>開始遊戲</button>
                </>
            ) : (
                <p>歡迎回來，{getPlayerName()}！</p>
            )}
        </div>
    );
};

export default NicknameInput;