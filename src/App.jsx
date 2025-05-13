import { Routes, Route, Link } from 'react-router-dom';
import Minesweeper from './components/Minesweeper';
import Snake from './components/Snake';
import WhacAMole from './components/WhacAMole';
import mine from './assets/mine.png';
import snake from './assets/snake.png';
import mice from './assets/mice.png';

function App() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1 style={{ marginBottom: '40px' }}>🎮 小遊戲大廳</h1>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '100px', flexWrap: 'wrap' }}>
                {/* 踩地雷 */}
                <GameCard
                  to="/minesweeper"
                  img={mine}
                  title="踩地雷"
                />
                {/* 貪吃蛇 */}
                <GameCard
                  to="/snake"
                  img={snake}
                  title="貪吃蛇"
                />
                {/* 打 IU */}
                <GameCard
                  to="/whac-a-mole"
                  img={mice}
                  title="打 IU"
                />
              </div>
            </>
          }
        />
        <Route path="/minesweeper" element={<Minesweeper />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/whac-a-mole" element={<WhacAMole />} />
      </Routes>
    </div>
  );
}

// 小卡片元件（減少重複）
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
        }}>
          {title}
        </button>
      </div>
    </Link>
  );
}

export default App;
