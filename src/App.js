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
  const audio = new window.Audio(src);
  audio.play();
};

function App() {
  const [step, setStep] = useState("start"); // start screen by default
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

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
      // Show thinking animation before reveal
      setStep("thinking");
      setTimeout(() => {
        setStep("reveal");
      }, 1800); // 1.8 seconds thinking time
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
      {/* Universal Restart Button */}
      <div className="top-bar">
        <button
          className="btn-restart"
          onClick={handleRestart}
          title="Restart Game"
        >
          ⟳ Restart
        </button>
      </div>

      <h1>Magic Number Guessing</h1>

      {/* Status Bar: Only show during play */}
      {step === "play" && (
        <div className="status-bar">
          <div className="status-label">
            Question {cardIndex + 1} / {cards.length}
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
          <p>
            Think of a number between <b>1 and 63</b>.<br />
            I’ll try to read your mind with 6 questions!
          </p>
          <button onClick={startGame} className="btn-primary">
            Start
          </button>
        </div>
      )}

      {/* Question Cards */}
      {step === "play" && (
        <div className="card-screen">
          <p>
            <b>
              Question {cardIndex + 1} of {cards.length}
            </b>
          </p>
          <p>Is your number in this set?</p>
          <div className="numbers-card">
            {cards[cardIndex].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <div className="choices">
            <button onClick={() => handleAnswer(true)} className="btn-yes">
              Yes
            </button>
            <button onClick={() => handleAnswer(false)} className="btn-no">
              No
            </button>
          </div>
        </div>
      )}

      {/* Thinking Animation */}
      {step === "thinking" && (
        <div className="screen">
          <p>Let me think...</p>
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
          <Confetti width={width} height={height} />
          <div className="screen" style={{ position: "relative" }}>
            <p>Your number is:</p>
            <h2 className="result">{computeNumber()}</h2>
            <button onClick={handleRestart} className="btn-primary">
              Play Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
