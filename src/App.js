import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import "./App.css";

// Hook to track window size for full-screen confetti
function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
}

// Generate cards for 1–63 (6 bits)
const generateCards = () => {
  let cards = [];
  for (let bit = 0; bit < 6; bit++) {
    let card = [];
    for (let n = 1; n <= 63; n++) {
      if (((n >> bit) & 1) === 1) card.push(n);
    }
    cards.push(card);
  }
  return cards;
};

const cards = generateCards();

// Utility to play sound
const playSound = (src) => {
  try {
    const audio = new window.Audio(src);
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (e) {
    console.log('Audio format not supported or file missing.', e);
  }
};

function App() {
  const [step, setStep] = useState("start"); // start, play, thinking, reveal
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const [width, height] = useWindowSize();

  // Restart game and show start screen
  const handleRestart = () => {
    setStep("start");
    setCardIndex(0);
    setAnswers([]);
  };

  // Start the guessing game from start screen
  const startGame = () => {
    setStep("play");
    setCardIndex(0);
    setAnswers([]);
  };

  // Handle answer for each card question
  const handleAnswer = (yes) => {
    const updated = [...answers, yes];
    setAnswers(updated);
    playSound(process.env.PUBLIC_URL + "/sounds/question.mp3");
    
    if (cardIndex < cards.length - 1) {
      setCardIndex(cardIndex + 1);
    } else {
      setStep("thinking");
      setTimeout(() => {
        setStep("reveal");
      }, 2000); // 2 seconds thinking time
    }
  };

  // Play reveal sound when showing result
  useEffect(() => {
    if (step === "reveal") {
      playSound(process.env.PUBLIC_URL + "/sounds/reveal.mp3");
    }
  }, [step]);

  const computeNumber = () => {
    let num = 0;
    answers.forEach((ans, i) => {
      if (ans) num += Math.pow(2, i);
    });
    return num;
  };

  return (
    <div className="App">
      {/* Top Bar for universally accessible buttons */}
      <div className="top-bar">
        <button
          className="btn-info"
          onClick={() => setShowHowItWorks(true)}
          title="How does it work?"
        >
          ℹ️ How It Works
        </button>
        {step !== "start" && (
          <button
            className="btn-restart"
            onClick={handleRestart}
            title="Restart Game"
          >
            ⟳ Restart
          </button>
        )}
      </div>

      <h1>Magic Number</h1>

      {/* Status Bar: Only show during play */}
      {step === "play" && (
        <div className="status-bar">
          <div className="status-label">
            <span>Question {cardIndex + 1} of {cards.length}</span>
            <span>{Math.round(((cardIndex + 1) / cards.length) * 100)}%</span>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${((cardIndex + 1) / cards.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {step === "start" && (
        <div className="screen">
          <h2>Mind Reading Trick</h2>
          <p>
            Think of a number between <b>1 and 63</b>.<br />
            Keep it a secret! I will read your mind using 6 simple questions.
          </p>
          <button onClick={startGame} className="btn-primary">
            Start Magic
          </button>
        </div>
      )}

      {/* Question Cards */}
      {step === "play" && (
        <div className="card-screen">
          <p>Is your number in this set?</p>
          <div className="numbers-card">
            {cards[cardIndex].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <div className="choices">
            <button onClick={() => handleAnswer(false)} className="btn-no">
              ✗ No
            </button>
            <button onClick={() => handleAnswer(true)} className="btn-yes">
              ✓ Yes
            </button>
          </div>
        </div>
      )}

      {/* Thinking Animation */}
      {step === "thinking" && (
        <div className="screen">
          <h2>Reading your mind...</h2>
          <p>Analyzing the binary patterns...</p>
          <div className="thinking-loader">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}

      {/* Reveal Result with Full Screen Confetti */}
      {step === "reveal" && (
        <>
          <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
          <div className="screen">
            <p>The number you're thinking of is...</p>
            <h2 className="result">{computeNumber()}</h2>
            <button onClick={handleRestart} className="btn-primary">
              Play Again
            </button>
          </div>
        </>
      )}

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setShowHowItWorks(false)}>×</button>
            <h2>How It Works</h2>
            <p>
              This trick is based on <b>Binary Numbers</b> (Base 2). Every number from 1 to 63 can be represented by exactly 6 binary bits (e.g., 63 is <code>111111</code>, 1 is <code>000001</code>).
            </p>
            <ul>
              <li>There are 6 cards, each representing a bit position (1, 2, 4, 8, 16, 32).</li>
              <li>A card displays a number if its corresponding bit is a <code>1</code> in binary.</li>
              <li>When you answer "Yes," the program adds the value of that bit to a running total.</li>
              <li>After 6 questions, all the "Yes" values are summed up to reveal your exact number!</li>
            </ul>
            <p>
              <i>Example:</i> If you think of 5 (binary <code>101</code>), you will say "Yes" to the 1st card (+1) and the 3rd card (+4). 1 + 4 = 5.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
