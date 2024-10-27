import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import "./App.css";
import unoBackground from "./uno.jpg";

function App() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const storedPlayers = localStorage.getItem("players");
    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers));
    } else {
      setPlayers([
        { name: "", scores: [] },
        { name: "", scores: [] },
      ]);
    }
  }, []);

  const savePlayersToLocalStorage = players => {
    localStorage.setItem("players", JSON.stringify(players));
  };

  const handleAddPlayer = () => {
    const updatedPlayers = [...players, { name: "", scores: [] }];
    setPlayers(updatedPlayers);
    savePlayersToLocalStorage(updatedPlayers);
  };

  const handleRemovePlayer = index => {
    if (players.length > 2) {
      const updatedPlayers = players.filter((_, i) => i !== index);
      setPlayers(updatedPlayers);
      savePlayersToLocalStorage(updatedPlayers);
    } else {
      alert("En az iki oyuncu olmalıdır.");
    }
  };

  const handlePlayerNameChange = (index, name) => {
    const formattedName = name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const isNameDuplicate = players.some(
      (player, idx) =>
        idx !== index &&
        player.name.toLowerCase() === formattedName.toLowerCase()
    );

    if (isNameDuplicate) {
      alert("Bu isimde bir oyuncu zaten var. Lütfen farklı bir isim girin.");
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[index].name = formattedName;
    setPlayers(updatedPlayers);
    savePlayersToLocalStorage(updatedPlayers);
  };

  const handleStartGame = () => {
    if (
      players.length >= 2 &&
      players.every(player => player.name.trim() !== "") &&
      new Set(players.map(player => player.name.toLowerCase())).size ===
        players.length
    ) {
      setGameStarted(true);
    } else if (players.some(player => player.name.trim() === "")) {
      alert("Lütfen tüm oyuncu isimlerini doldurun.");
    } else if (
      new Set(players.map(player => player.name.toLowerCase())).size !==
      players.length
    ) {
      alert("Lütfen her oyuncu için benzersiz bir isim kullanın.");
    } else {
      alert("Lütfen en az iki oyuncu ekleyin.");
    }
  };

  const handleScoreChange = (playerIndex, score) => {
    const updatedPlayers = [...players];
    const parsedScore = parseInt(score, 10);

    if (score === "" || isNaN(parsedScore)) {
      return;
    }

    updatedPlayers[playerIndex].scores[currentRound - 1] = parsedScore;
    setPlayers(updatedPlayers);
    savePlayersToLocalStorage(updatedPlayers);
  };

  const handleFinishRound = () => {
    if (
      players.every(
        player =>
          player.scores[currentRound - 1] !== undefined &&
          player.scores[currentRound - 1] !== null &&
          !isNaN(player.scores[currentRound - 1])
      )
    ) {
      setCurrentRound(currentRound + 1);
    } else {
      alert("Lütfen tüm oyuncuların skorlarını girin.");
    }
  };

  const handleFinishGame = () => {
    setGameFinished(true);
    setShowResults(true);
    revealResults();
  };

  const handleResetGame = () => {
    setPlayers([
      { name: "", scores: [] },
      { name: "", scores: [] },
    ]);
    setGameStarted(false);
    setCurrentRound(1);
    setGameFinished(false);
    setShowResults(false);
    setDisplayedResults([]);
    setShowConfetti(false);
    localStorage.removeItem("players");
  };

  const handleShowDetails = playerIndex => {
    setSelectedPlayer(playerIndex);
  };

  const handleCloseDetails = () => {
    setSelectedPlayer(null);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const totalScoreA = a.scores.reduce((total, score) => total + (score || 0), 0);
    const totalScoreB = b.scores.reduce((total, score) => total + (score || 0), 0);
    return totalScoreA - totalScoreB; // Az puan alan önce gelecek
  });

  const getPlayerRank = (player, index) => {
    if (!player) return "";
    
    const playerScores = sortedPlayers.map(p => p.scores.reduce((total, score) => total + (score || 0), 0));
    const uniqueScores = [...new Set(playerScores)];
    const playerScore = player.scores.reduce((total, score) => total + (score || 0), 0);
    
    const rank = uniqueScores.indexOf(playerScore) + 1;
    const sameRankPlayers = sortedPlayers.filter(p => 
      p.scores.reduce((total, score) => total + (score || 0), 0) === playerScore
    );

    let rankText = `${rank}. `;
    let names = sameRankPlayers.map(p => p.name).join(", ");

    let emoji;
    switch (rank) {
      case 1:
        emoji = "🥇";
        break;
      case 2:
        emoji = "🥈";
        break;
      case 3:
        emoji = "🥉";
        break;
      case 4:
        emoji = "👏";
        break;
      default:
        emoji = "";
    }

    return `${emoji} ${rankText}${names}`;
  };

  const revealResults = () => {
    const uniqueRanks = [];
    const sortedPlayersCopy = [...sortedPlayers];
    const revealInterval = setInterval(() => {
      if (sortedPlayersCopy.length > 0) {
        const player = sortedPlayersCopy.pop();
        const rankInfo = getPlayerRank(player, sortedPlayers.length - sortedPlayersCopy.length - 1);
        if (!uniqueRanks.includes(rankInfo)) {
          uniqueRanks.push(rankInfo);
          setDisplayedResults(prev => [...prev, { rankInfo, score: player.scores.reduce((total, score) => total + (score || 0), 0) }]);
        }
        if (sortedPlayersCopy.length === 0) {
          setShowConfetti(true);
          clearInterval(revealInterval);
        }
      }
    }, 3000);
  };

  return (
    <div className="container" style={{backgroundImage: `url(${unoBackground})`}}>
    <div className="white-area">
      <h1>Uno Skor Takip</h1>

      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {!gameStarted && (
        <div>
          {players.map((player, index) => (
            <div key={index} className="player-input">
              <input
                type="text"
                placeholder={`Oyuncu ${index + 1} Adı`}
                value={player.name}
                onChange={e => handlePlayerNameChange(index, e.target.value)}
              />
              {players.length > 2 && (
                <button
                  className="remove-player-btn"
                  onClick={() => handleRemovePlayer(index)}
                >
                  -
                </button>
              )}
              {index === players.length - 1 && (
                <button className="add-player-btn" onClick={handleAddPlayer}>
                  +
                </button>
              )}
            </div>
          ))}
          <button className="start-game-btn" onClick={handleStartGame}>
            Oyunu Başlat
          </button>
        </div>
      )}

      {gameStarted && !gameFinished && (
        <div>
          <div className="round-number">Round {currentRound}</div>
          {players.map((player, playerIndex) => (
            <div key={playerIndex} className="player-score">
              <span className="player-name">{player.name}</span>
              {currentRound > 1 && (
                <button
                  className="detail-btn"
                  onClick={() => handleShowDetails(playerIndex)}
                >
                  Detay
                </button>
              )}
              <input
                type="number"
                min="0"
                onChange={e => handleScoreChange(playerIndex, e.target.value)}
                value={player.scores[currentRound - 1] ?? ""}
                required
              />
            </div>
          ))}
          <button className="finish-round-btn" onClick={handleFinishRound}>
            El Bitir
          </button>
          <button className="finish-game-btn" onClick={handleFinishGame}>
            Oyunu Bitir
          </button>
        </div>
      )}

      {selectedPlayer !== null && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseDetails}>
              &times;
            </span>
            <h2>{players[selectedPlayer].name} - Önceki Skorlar</h2>
            {players[selectedPlayer].scores
              .slice(0, currentRound - 1)
              .map((score, index) => (
                <p key={index}>
                  {index + 1}: {score}
                </p>
              ))}
          </div>
        </div>
      )}

      {showResults && (
        <div className="results">
          <h2>Oyun Sonuçları</h2>
          {displayedResults.map((result, index) => (
            <div key={index} className="result-item">
              <span>{result.rankInfo}</span>
              <span>{result.score}</span>
            </div>
          ))}
          {displayedResults.length === new Set(sortedPlayers.map(p => p.scores.reduce((total, score) => total + (score || 0), 0))).size && (
            <button className="new-game-btn" onClick={handleResetGame}>
              Yeni Oyun
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default App;