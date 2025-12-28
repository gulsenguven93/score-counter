import { use, useState } from "react";
import "./App.css";

function App() {
  const [players, setPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState("");
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [round, setRound] = useState(1);
  const [gameType, setGameType] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [maxRounds, setMaxRounds] = useState("");

  const maxScore = isGameFinished
    ? Math.max(...players.map((player) => getTotalScore(player.scores)))
    : null;

  const winners = isGameFinished
    ? players.filter((player) => getTotalScore(player.scores) === maxScore)
    : [];

  const startNewGame = () => {
    setPlayers([]);
    setPlayerCount("");
    setIsGameStarted(false);
    setIsGameFinished(false);
    setCurrentScore("");
    setCurrentPlayerIndex(0);
    setRound(1);
  };

  function updatePlayerName(index, value) {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === index ? { ...player, name: value } : player
      )
    );
  }

  function createPlayers() {
    const count = Number(playerCount);

    if (!count || count <= 0) return;

    const newPlayers = [];

    for (let i = 0; i < count; i++) {
      newPlayers.push({
        name: "",
        scores: [],
      });
    }
    setPlayers(newPlayers);
    setGameType("");
    setTargetScore("");
    setMaxRounds("");
  }

  function startGame() {
    const finalizedPlayers = players.map((player, index) => ({
      ...player,
      name:
        player.name && player.name.trim().length > 0
          ? player.name
          : `${index + 1}. Oyuncu`,
    }));

    setPlayers(finalizedPlayers);
    setIsGameStarted(true);
    setCurrentPlayerIndex(0);
    setRound(1);
  }

  function shouldGameEnd(updatedPlayers, nextRound) {
    if (gameType === "free") {
      return false;
    }

    if (gameType === "target") {
      return updatedPlayers.some(
        (p) => getTotalScore(p.scores) >= Number(targetScore)
      );
    }

    if (gameType === "round") {
      return nextRound > Number(maxRounds);
    }
    return false;
  }

  function submitScore() {
    if (currentScore === "") return;

    const score = Number(currentScore);
    if (isNaN(score)) return;

    const updatedPlayers = players.map((player, index) =>
      index === currentPlayerIndex
        ? { ...player, scores: [...player.scores, score] }
        : player
    );

    const currentPlayer = updatedPlayers[currentPlayerIndex];
    const newTotal = getTotalScore(currentPlayer.scores);

    if (gameType === "target" && newTotal >= Number(targetScore)) {
      setPlayers(updatedPlayers);
      setIsGameFinished(true);
      setCurrentScore("");
      return;
    }

    const nextIndex = (currentPlayerIndex + 1) % players.length;
    const nextRound = nextIndex === 0 ? round + 1 : round;

    const gameEnded =
      gameType === "round" && shouldGameEnd(updatedPlayers, nextRound);

    setPlayers(updatedPlayers);

    setCurrentScore("");

    if (gameEnded) {
      setIsGameFinished(true);
      return;
    }

    setCurrentPlayerIndex(nextIndex);

    if (nextIndex === 0) {
      setRound((r) => r + 1);
    }
  }

  function getTotalScore(scores) {
    return scores.reduce((total, s) => total + s, 0);
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">SKOR TAKİBİ</h1>
        {!isGameStarted && (
          <div className="input-row">
            <input
              type="number"
              placeholder="Oyuncu Sayısı"
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
            />
            <button onClick={createPlayers}>Oyuncuları Oluştur</button>
            <p>Oyuncu Sayısı: {players.length}</p>
          </div>
        )}

        {players.length > 0 && !isGameStarted && (
          <div>
            <h3>Oyuncu İsimleri</h3>

            {players.map((player, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder={`${index + 1}. Oyuncu`}
                  value={player.name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                />
              </div>
            ))}

            <div className="game-type">
              <select
                value={gameType}
                onChange={(e) => {
                  setGameType(e.target.value);
                  setTargetScore("");
                  setMaxRounds("");
                }}
              >
                <option value="">Oyun Tipi Seçin</option>
                <option value="free">Serbest Oyun</option>
                <option value="target">Hedef Puana Ulaş</option>
                <option value="round">Sabit Tur Sayılı</option>
              </select>
              {gameType === "target" && (
                <input
                  type="number"
                  placeholder="Hedef Puan"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                />
              )}

              {gameType === "round" && (
                <input
                  type="number"
                  placeholder="Tur Sayısı"
                  value={maxRounds}
                  onChange={(e) => setMaxRounds(e.target.value)}
                />
              )}
            </div>

            <button
              className="secondary"
              onClick={startGame}
              disabled={
                !gameType ||
                (gameType === "target" && !targetScore) ||
                (gameType === "round" && !maxRounds)
              }
            >
              Oyuna Başla
            </button>
          </div>
        )}

        {isGameStarted && !isGameFinished && (
          <div>
            <div className="round-display">{round}. TUR</div>
            <h2 className="current-player">
              {players[currentPlayerIndex].name}
            </h2>
            <input
              type="number"
              placeholder="Puan"
              value={currentScore}
              onChange={(e) => setCurrentScore(e.target.value)}
            />
            <button
              className="secondary"
              onClick={submitScore}
              disabled={currentScore === ""}
            >
              Sıradaki oyuncu
            </button>

            {gameType === "free" &&
              currentPlayerIndex === players.length - 1 && (
                <button
                  className="secondary"
                  onClick={() => {
                    submitScore();
                    setIsGameFinished(true);
                  }}
                  disabled={currentScore === ""}
                >
                  Oyunu Bitir
                </button>
              )}
          </div>
        )}
        {isGameFinished && (
          <div>
            <h3 className="score-title">Skorlar</h3>
            <ul>
              {players.map((player, index) => (
                <li key={index}>
                  {player.name}: {getTotalScore(player.scores)}
                </li>
              ))}
            </ul>
            {isGameFinished && winners.length > 0 && (
              <div className="winner">
                {winners.map((p) => (
                  <div key={p.name}>{p.name}</div>
                ))}
              </div>
            )}
            <button className="secondary" onClick={startNewGame}>
              Yeni Oyun
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
