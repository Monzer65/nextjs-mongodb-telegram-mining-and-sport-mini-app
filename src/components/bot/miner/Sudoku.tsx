"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Maximize2, Minimize2 } from "lucide-react";
import confetti from "canvas-confetti";
import * as sudoku from "sudoku";
import clsx from "clsx";

type Cell = string;
type Board = Cell[];
type Difficulty = "easy" | "medium" | "hard";

const difficultyLevels: Record<Difficulty, number> = {
  easy: 35,
  medium: 45,
  hard: 55,
};

const generateSudokuBoard = (difficulty: Difficulty): Board => {
  const puzzle = sudoku.makepuzzle();
  const solution = sudoku.solvepuzzle(puzzle);
  const numToRemove = difficultyLevels[difficulty];
  const board = solution.map((num: number) =>
    num !== null ? (num + 1).toString() : "."
  );

  for (let i = 0; i < numToRemove; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * 81);
    } while (board[index] === ".");
    board[index] = ".";
  }

  return board;
};

const isValidMove = (board: Board, index: number, value: string): boolean => {
  const tempBoard = [...board];
  tempBoard[index] = value;
  return (
    sudoku.solvepuzzle(
      tempBoard.map((cell) => (cell === "." ? null : parseInt(cell) - 1))
    ) !== null
  );
};

const isBoardComplete = (board: Board): boolean => {
  return board.every((cell) => cell !== ".");
};

export default function SudokuGame() {
  const [gameState, setGameState] = useState<
    "selecting" | "playing" | "completed"
  >("selecting");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakeHighlight, setMistakeHighlight] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing") {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const selectDifficulty = (selected: string) => {
    setDifficulty(selected as Difficulty);
    const newBoard = generateSudokuBoard(selected as Difficulty);
    setBoard(newBoard);
    setInitialBoard([...newBoard]);
    setGameState("playing");
    setTime(0);
    setMistakes(0);
    setMistakeHighlight(null);
  };

  const handleCellClick = (index: number) => {
    if (initialBoard[index] === ".") {
      setSelectedCell(index);
      setMistakeHighlight(null);
    }
  };

  const handleNumberInput = (value: string) => {
    if (selectedCell === null || initialBoard[selectedCell] !== ".") return;

    if (isValidMove(board, selectedCell, value)) {
      const newBoard = [...board];
      newBoard[selectedCell] = value;
      setBoard(newBoard);
      setMistakeHighlight(null);

      if (isBoardComplete(newBoard)) {
        completeGame();
      }
    } else {
      setMistakes((prevMistakes) => prevMistakes + 1);
      setMistakeHighlight(selectedCell);
    }
  };

  const completeGame = () => {
    setGameState("completed");
    const baseScore = 1000;
    const timeDeduction = Math.floor(time / 10);
    const mistakeDeduction = mistakes * 50;
    const finalScore = Math.max(
      baseScore - timeDeduction - mistakeDeduction,
      0
    );
    setScore(finalScore);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const saveScore = () => {
    console.log("Score saved:", score);
  };

  return (
    <div
      dir='ltr'
      className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 p-4'
    >
      {gameState === "selecting" && (
        <div className='flex flex-col items-center space-y-6'>
          <h2 className='text-3xl font-extrabold text-gray-800'>
            Select Difficulty
          </h2>
          <Select onValueChange={selectDifficulty}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Select Difficulty' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='easy'>Easy</SelectItem>
              <SelectItem value='medium'>Medium</SelectItem>
              <SelectItem value='hard'>Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(gameState === "playing" || gameState === "completed") && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div className='text-xl font-semibold'>Time: {time}s</div>
            <div className='text-xl font-semibold text-red-600'>
              Mistakes: {mistakes}
            </div>
            <Button onClick={toggleFullScreen} className='rounded-full'>
              {isFullScreen ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </div>

          <div className='grid grid-cols-9 gap-0.5 bg-gray-300 p-2 rounded-lg shadow-md'>
            {board.map((cell, index) => (
              <div
                key={index}
                className={clsx(
                  "w-10 h-10 flex items-center justify-center bg-white text-lg rounded cursor-pointer shadow transition-colors duration-300",
                  {
                    "bg-red-200": mistakeHighlight === index,
                    "bg-blue-100":
                      selectedCell === index && mistakeHighlight !== index,
                    "font-bold": initialBoard[index] !== ".",
                  },
                  {
                    "border-b-2":
                      Math.floor(index / 9) % 3 === 2 &&
                      Math.floor(index / 9) !== 8,
                    "border-r-2": index % 9 === 2 || index % 9 === 5,
                  },
                  "border-gray-500"
                )}
                onClick={() => handleCellClick(index)}
              >
                {cell !== "." ? cell : ""}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-9 gap-2'>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <Button
                key={num}
                onClick={() => handleNumberInput(num)}
                className='text-lg'
              >
                {num}
              </Button>
            ))}
          </div>

          {gameState === "completed" && (
            <div className='text-center space-y-4'>
              <h2 className='text-3xl font-extrabold'>Game Completed!</h2>
              <p className='text-xl'>Your score: {score}</p>
              <Button onClick={saveScore}>Save Score</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
