import { useEffect, useMemo, useRef, useState } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";



const App = () => {

/**
  * State Variables:
  * - `guesses`: 2D array of user's guesses in a grid.
  * - `word`: Word of the day from a 5-words list API.
  * - `hasWonRound`: State of winning a round.
  * - `hasLostRound`: State of losing a round.
  * - `gameStartScreen`: State of the game start screen.
  * - `winStreak`: Number of consecutive wins by the player.
  * - `colors`: 2D array of cell colors in the grid.
  * - `score`: Player's score.
  * - `timer`: Countdown timer in seconds -- 2min 30 secs.
  * - `timerRef`: Reference to the timer interval.
  * - `isPlaying`: State of the music player.
  * - `currentTime`: Current playback position of the music player.
  * - `currentSongIndex`: Index of the current song -- picked randomly
  * - `audioRef`: Reference to the audio element.
  * - `inputRefs`: Reference to an array of input elements.
**/

  const [guesses, setGuesses] = useState(Array(6).fill(Array(5).fill('')));
  const [word, setWord] = useState('');
  const [hasWonRound, setHasWonRound] = useState(false);
  const [hasLostRound, setHasLostRound] = useState(false);
  const [gameStartScreen, setGameStartScreen] = useState(true);
  const [winStreak, setWinStreak] = useState(0);
  const [colors, setColors] = useState(Array(6).fill(Array(5).fill("bg-neutral-300")));
  const [score, setScore] = useState(2);
  const [timer, setTimer] = useState(150);
  const timerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef(null);
  const inputRefs = useRef([]);


  
  // Fetch a random word from the 5-words list API
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/charlesreid1/five-letter-words/master/sgb-words.txt')
      .then((response) => response.text())
      .then((data) => {
        const words = data.split('\n');
        const randomIndex = Math.floor(Math.random() * words.length);
        setWord(words[randomIndex]);
      })
      .catch(error => console.error("Error fetching new word:", error));
  
  }, []);





  /**************  TIMER:  ***********/
  useEffect(() => {
    /* Start the timer only when not in the game start
       screen or if the round/game is not yet won/lost*/
    if (!gameStartScreen && !hasWonRound && !hasLostRound) {
      if (timer > 0) {
        timerRef.current = setTimeout(() => {
          setTimer(timer - 1);
        }, 1000); // Update timer every 1000 milliseconds
      } else {
        /* If the timer runs out, lose the
           round and deduct 1 point */
        setHasLostRound(true);
        setScore((prevScore) => prevScore - 1);
      }
      /* Clean up when the timer component is unmounted */
      return () => clearTimeout(timerRef.current);
    }
  }, [timer, gameStartScreen, hasWonRound, hasLostRound]);






  /***********  MUSIC  ***********/
  /* Array of songs url */
  const songs = useMemo(() => [
    // "./song1.mp3",
    // "./song2.mp3",
    // "./song3.mp3",
    // "./song4.mp3",
    // "./song5.mp3",
    // "./song6.mp3",
    // "./song7.mp3",
    // "./song8.mp3",
    // "./song9.mp3",
    // "./song10.mp3",
    // "./song11.mp3",
    // "./song12.mp3",
    // "./song13.mp3",
    // "./song14.mp3",
    // "./song15.mp3"
    `${process.env.PUBLIC_URL}/song1.mp3`,
    `${process.env.PUBLIC_URL}/song2.mp3`,
    `${process.env.PUBLIC_URL}/song3.mp3`,
    `${process.env.PUBLIC_URL}/song4.mp3`,
    `${process.env.PUBLIC_URL}/song5.mp3`,
    `${process.env.PUBLIC_URL}/song6.mp3`,
    `${process.env.PUBLIC_URL}/song7.mp3`,
    `${process.env.PUBLIC_URL}/song8.mp3`,
    `${process.env.PUBLIC_URL}/song9.mp3`,
    `${process.env.PUBLIC_URL}/song10.mp3`,
    `${process.env.PUBLIC_URL}/song11.mp3`,
    `${process.env.PUBLIC_URL}/song12.mp3`,
    `${process.env.PUBLIC_URL}/song13.mp3`,
    `${process.env.PUBLIC_URL}/song14.mp3`,
    `${process.env.PUBLIC_URL}/song15.mp3`
  ], []);
  


  /* Set a random song as initial song when app starts: */
  useEffect(() => {
    audioRef.current.src = songs[Math.floor(Math.random() * songs.length)];
  }, [songs])



  /* Simulates a progress bar by tracking playback position */
  useEffect(() => {
    /* Update playback position when playing: */
    if (isPlaying) {
      const interval = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);  // Update interval every 100 milliseconds

      /* Cleanup on unmount */
      return () => clearInterval(interval);
    }
  }, [isPlaying]);


  
  
  /* Toggle between pause and play: */
  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      /* Resume from paused position: */
      audioRef.current.currentTime = currentTime;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };


  /* When a song ends: */
  const songEnded = () => {
    /* Move to the next track in songs array: */
    const nextSongIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextSongIndex);

    /* Play the next song automatically: */
    audioRef.current.src = songs[nextSongIndex];
    audioRef.current.play();
  }
  
  /***********  MUSIC  ***********/

  




  /* Function to handle the input of the user in
     the cells of the grid */
  const handleInputChange = (value, rowIndex, colIndex) => {

    /* Check if the input is a letter */
    if ((value >= 'a' && value <= 'z') || (value >= 'A' && value <= 'Z')) {

      /* Check if the game is already won */
      if (hasWonRound) {
        return;
      }

      /* Check if the first column in the current
         row can be edited */
      if (colIndex === 0 && rowIndex > 0) {
        /* Check if the previous row is completely filled out */
        const previousRowFilled = guesses[rowIndex - 1].every(col => col !== '');
        if (!previousRowFilled) {
          return;
        }
      }

      /* Check if the previous cell is filled */
      else if (colIndex > 0 && guesses[rowIndex][colIndex - 1] === '') {
        return;
      }

      /* Create a copy of the guesses array */
      const newGuesses = [...guesses.map(row => [...row])];
      /* Create a copy of the colors array */
      const newColors = [...colors.map(row => [...row])];

      /* Update the value of the cell */
      newGuesses[rowIndex][colIndex] = value;
      /* Update the guesses array with the new array */
      setGuesses(newGuesses);

      /* Move the focus to the next cell */
      if (colIndex < 4) {
        const nextIndex = (rowIndex * 5) + colIndex + 1;
        if (inputRefs.current[nextIndex]) {
          inputRefs.current[nextIndex].focus();
        }
      } 
      else if (colIndex < 5) {
        const nextIndex = (rowIndex + 1) * 5;
        if (inputRefs.current[nextIndex]) {
          inputRefs.current[nextIndex].focus();
        }
      }

      /* Check if the row is complete */
      if (colIndex === 4) {
        const guessedWord = newGuesses[rowIndex].join('');

        /* Check if the word is correct */
        if (guessedWord.toUpperCase() === word.toUpperCase()) {
          setHasWonRound(true);
          setScore(score + 2);
          setWinStreak(winStreak + 1);
        }
        /* If the word is incorrect */
        else if (rowIndex === 5) {
          setHasLostRound(true);
          setScore(score - 1);
          setWinStreak(0);
        }

        /* Create arrays from the target word and the guessed word */
        const wordArray = word.toUpperCase().split('');
        const guessedWordArray = guessedWord.toUpperCase().split('');

        /* Mark correct cells green */
        for (let i = 0; i < 5; i++) {
          if (guessedWordArray[i] === wordArray[i]) {
            newColors[rowIndex][i] = "bg-green-500";
            wordArray[i] = null;
            guessedWordArray[i] = null;
          }
        }

        /* Mark correct letters in wrong spots yellow */
        for (let i = 0; i < 5; i++) {
          if (guessedWordArray[i] !== null && wordArray.includes(guessedWordArray[i])) {
            newColors[rowIndex][i] = "bg-yellow-500";
            wordArray[wordArray.indexOf(guessedWordArray[i])] = null;
          }
        }

        /* Update the colors array with the new array */
        setColors(newColors);
      }
    }
  };






  return (    
    <div className=" bg-orange-50 min-h-screen flex flex-col items-center">

      {/* Header: */}
      <h1 className="font-extrabold text-4xl mt-20">WORDLE</h1>
      {/* Instruction: */}
      <h1 className="mb-12">Guess the 5-letter word</h1>


      {/* Game Board: */}
      <div className="flex items-center">

        {/* Score: */} 
        <div className="items-center mr-10 mb-10
                      bg-neutral-800 text-orange-50 py-4 px-5">
          <h2 className="font-bold text-xs text-center pt-1 pb-0">SCORE</h2>
          <h1 className="font-bold text-2xl text-center">{score}</h1>
        </div>

        
        {/* Board: */}
        <div className="grid grid-cols-5 gap-3">
          {/* Map through the guesses tiles */}
          {guesses.map((row, rowIndex) =>
            /* Map through each tile in a row */
            row.map((col, colIndex) => (
              /* Create a tile with a text input */
              <input 
                  key={`${rowIndex}-${colIndex}`}
                  value={col}
                  className= {`h-14 w-12 text-center border-2 border-black
                              font-semibold text-2xl uppercase
                              cursor-default caret-transparent
                              ${colors[rowIndex][colIndex]}
                              focus:outline-none focus:ring-2 focus:ring-black
                              focus:border-transparent focus:shadow-2xl`}
                  maxLength={1}
                  onChange={(e) => handleInputChange(e.target.value, rowIndex, colIndex)}
                  ref={(el) => (inputRefs.current[rowIndex * 5 + colIndex] = el)}
              />
            ))
          )}
        </div>


        {/* Timer: */}
        <div className="items-center text-center ml-10 mb-10
                        bg-neutral-800 text-orange-50 p-4">
          <h2 className="text-xs font-bold">TIMER</h2>
          {/* Display timer in minutes: */}
          <h1 className="text-2xl font-bold">
            {Math.floor(timer / 60).toString().padStart(1, '0')}:
            {Math.floor(timer % 60).toString().padStart(2, '0')}
          </h1>
        </div>
      </div>





      {/********************   Popups   ********************/}

      {/* Game Start Popup: */}
      {gameStartScreen && (
        <div className="fixed top-0 left-0 w-full h-full bg-orange-50 flex items-center justify-center">
          <div className="bg-orange-100 p-8 border-black border-4 shadow-2xl text-center">
            <h2 className="text-2xl font-extrabold mb-9">WORDLE</h2>

            {/* Game Instructions: */}
            <p className="text-base mt-2 text-left">
              <span className="font-semibold">1.</span> Click on the first box to start typing
            </p>
            <p className="text-base mt-1 text-left">
              <span className="font-semibold">2.</span> To set the mood, hit audio button
            </p>
            <p className="text-base mt-1 text-left">
              <span className="font-semibold">3.</span> Get word right = 
              <span className="font-semibold italic"> +2 points</span>
            </p>
            <p className="text-base mt-1 text-left">
              <span className="font-semibold">4.</span> Get word wrong =
              <span className="font-semibold italic"> -1 point</span>
            </p>
            <p className="text-base mt-1 text-left">
              <span className="font-semibold">5.</span> Get 
              <span className="font-semibold"> 5 words </span>  in a row =
              <span className="font-semibold italic"> Win Game</span>
            </p>
            <p className="text-base mt-1 text-left">
              <span className="font-semibold">6.</span> Score gets down to 0 =
              <span className="font-semibold italic"> Lose Game </span>
            </p>
            <p className="text-base mt-1 text-left">
              <span className="font-semibold">7. </span> 
              Beat the timer each round
            </p>
            <p className="text-xs italic">Goodluck. You got this!</p>

            
            <button
              onClick={() => {
                /* Focus the first input element
                   once the screen starts */
                if (inputRefs.current[0]) {
                  inputRefs.current[0].focus();
                }

                setGameStartScreen(false);
              }}
              className="bg-neutral-800 text-white px-4 py-2 mt-9 mb-4 shadow-lg
                         text-sm font-semibold hover:bg-neutral-900"
            >
              Start Game
            </button>
          </div>
        </div>
      )}





      {/* Win Round Popup */}
      {hasWonRound && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-orange-100 p-8 shadow-lg text-center">
            <h2 className="text-2xl font-extrabold">CONGRATS</h2>
            <p className="text-base mt-4">You got the word</p>
            <p className="text-xl font-bold">"{word}"</p>
            <button
              onClick={() => {
                setGuesses(Array(6).fill(Array(5).fill('')));
                setHasWonRound(false);
                setColors(Array(6).fill(Array(5).fill("bg-gray-200")));
                setTimer(150);
                
                /* Fetch a random word from the 5-words list API */
                fetch('https://raw.githubusercontent.com/charlesreid1/five-letter-words/master/sgb-words.txt')
                .then((response) => response.text())
                .then((data) => {
                  const words = data.split('\n');
                  const randomIndex = Math.floor(Math.random() * words.length);
                  setWord(words[randomIndex]);
                })
                .catch(error => console.error("Error fetching new word:", error));


                /* Focus the first input element once the screen starts */
                if (inputRefs.current[0]) {
                  inputRefs.current[0].focus();
                }
              }}

              className="bg-neutral-800 text-white px-4 py-2 mt-6
                         text-sm font-semibold hover:bg-neutral-900"
            >
              Next Word
            </button>
          </div>
        </div>
      )}



      {/* Lose Round Popup */}
      {/* Display popup that shows what the correct word was */}
      {hasLostRound && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60
                        flex items-center justify-center">
          <div className="bg-neutral-900 text-center text-orange-100 p-8 shadow-lg">
            <h2 className="text-2xl font-extrabold">OH NO!</h2>
            <p className="text-base mt-4">The correct word is</p>
            <p className="text-xl font-bold">"{word}"</p>
            <button
              onClick={() => {
                setGuesses(Array(6).fill(Array(5).fill('')));
                setHasLostRound(false);
                setColors(Array(6).fill(Array(5).fill("bg-gray-200")));
                setWinStreak(0);
                setTimer(150);



                /* Fetch a random word from the 5-words list API */
                fetch('https://raw.githubusercontent.com/charlesreid1/five-letter-words/master/sgb-words.txt')
                .then((response) => response.text())
                .then((data) => {
                  const words = data.split('\n');
                  const randomIndex = Math.floor(Math.random() * words.length);
                  setWord(words[randomIndex]);
                })
                .catch(error => console.error("Error fetching new word:", error));


                /* Focus the first input element once the screen starts */
                if (inputRefs.current[0]) {
                  inputRefs.current[0].focus();
                }
              }}
              className="bg-orange-100 text-neutral-800 px-4 py-2 mt-6
                         text-sm font-semibold hover:bg-orange-200"
            >
              Next Word
            </button>
          </div>
        </div>
      )}








      {/* Win Game Popup */}
      {/* When the player wins 5 levels in a row */}
      {(hasWonRound && winStreak === 3) && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center">
          <Fireworks width={600} height={800} autorun={{ speed: 1.5}} />
          <div className="bg-orange-100 p-8 shadow-lg text-center">
            <h2 className="text-2xl px-3 font-extrabold">YOU WON!</h2>
            <p className="text-base mt-4">You got the word</p>
            <p className="text-xl font-bold">"{word}"</p>
            <button
              onClick={() => {
                setGuesses(Array(6).fill(Array(5).fill('')));
                setHasWonRound(false);
                setColors(Array(6).fill(Array(5).fill("bg-gray-200")));
                setScore(2);
                setWinStreak(0);
                setTimer(150);
                
                /* Fetch a random word from the 5-words list API */
                fetch('https://raw.githubusercontent.com/charlesreid1/five-letter-words/master/sgb-words.txt')
                .then((response) => response.text())
                .then((data) => {
                  const words = data.split('\n');
                  const randomIndex = Math.floor(Math.random() * words.length);
                  setWord(words[randomIndex]);
                })
                .catch(error => console.error("Error fetching new word:", error));


                /* Focus the first input element once the screen starts */
                if (inputRefs.current[0]) {
                  inputRefs.current[0].focus();
                }
              }}

              className="bg-neutral-800 text-white px-4 py-2 mt-6
                         text-sm font-semibold hover:bg-neutral-900"
            >
              Play Again
            </button>
          </div>
        </div>
      )}







      {/* Lose Game Popup */}
      {/* When the score goes down to 0 */}
      {(hasLostRound && score === 0) && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60
                        flex items-center justify-center">
          <div className="bg-neutral-900 text-center border-2 border-orange-100 text-orange-100 p-8 shadow-lg">
            <h2 className="text-2xl font-extrabold">GAME OVER!</h2>
            <p className="text-base mt-4">The correct word is</p>
            <p className="text-xl font-bold">"{word}"</p>
            <button
              onClick={() => {
                setGuesses(Array(6).fill(Array(5).fill('')));
                setHasLostRound(false);
                setColors(Array(6).fill(Array(5).fill("bg-gray-200")));
                setScore(2);
                setWinStreak(0);
                setTimer(150);


                /* Fetch a random word from the 5-words list API */
                fetch('https://raw.githubusercontent.com/charlesreid1/five-letter-words/master/sgb-words.txt')
                .then((response) => response.text())
                .then((data) => {
                  const words = data.split('\n');
                  const randomIndex = Math.floor(Math.random() * words.length);
                  setWord(words[randomIndex]);
                })
                .catch(error => console.error("Error fetching new word:", error));


                /* Focus the first input element once the screen starts */
                if (inputRefs.current[0]) {
                  inputRefs.current[0].focus();
                }
              }}
              className="bg-orange-100 text-neutral-800 px-4 py-2 mt-6
                         text-sm font-semibold hover:bg-orange-200"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/********************   Popups   ********************/}






      



      {/* Music: */}
      {/* Audio Element: */}
      <audio ref={audioRef} onEnded={songEnded} loop={false}></audio>

      {/* Button to toggle music */}
      <button
        onClick={toggleMusic}
        className="bg-neutral-800 text-orange-50 px-6 py-3 mt-12 rounded-2xl border-2
                   hover:bg-neutral-700 hover:border-black"
      >
        {isPlaying? <SpeakerXMarkIcon className="size-4"/> : <SpeakerWaveIcon className="size-4"/>}
      </button>

    </div>
  );
};

export default App;