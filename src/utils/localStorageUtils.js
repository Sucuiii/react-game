// src/utils/localStorageUtils.js

// 取得某個遊戲的高分榜
const getHighScores = (gameName) => {
    const scores = JSON.parse(localStorage.getItem(`highScores_${gameName}`)) || [];
    return scores.sort((a, b) => b.score - a.score);
};

// 儲存高分，如果該玩家已有紀錄且新分數更高就更新，否則新增
const saveHighScore = (gameName, playerName, score) => {
    if (!playerName || playerName.trim() === '') {
        console.warn('Attempted to save high score without a valid player name.');
        return;
    }

    const currentScores = getHighScores(gameName);
    const trimmedPlayerName = playerName.trim();

    let playerFound = false;
    const updatedScores = currentScores.map(entry => {
        if (entry.name === trimmedPlayerName) {
            playerFound = true;
            return score > entry.score
                ? { name: trimmedPlayerName, score: score, date: new Date().toISOString() }
                : entry;
        }
        return entry;
    });

    if (!playerFound) {
        updatedScores.push({
            name: trimmedPlayerName,
            score: score,
            date: new Date().toISOString()
        });
    }

    const sortedScores = updatedScores.sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(`highScores_${gameName}`, JSON.stringify(sortedScores));
};

// 取得目前玩家的暱稱
const getPlayerName = () => {
    return localStorage.getItem('playerName') || '';
};

// 設定目前玩家的暱稱
const setPlayerName = (name) => {
    localStorage.setItem('playerName', name);
};

// 統一導出
export {
    getHighScores,
    saveHighScore,
    getPlayerName,
    setPlayerName
};
