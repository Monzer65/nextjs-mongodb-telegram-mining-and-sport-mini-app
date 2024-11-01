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
import { useInitData } from "@telegram-apps/sdk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDictionary } from "@/get-dictionary";

type Cell = string;
type Board = Cell[];
type Difficulty = "easy" | "medium" | "hard";

const difficultyLevels: Record<Difficulty, number> = {
  easy: 45,
  medium: 55,
  hard: 70,
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

async function updateUserScore(telegramId: number, score: number) {
  const response = await fetch(`/api/users/${telegramId}/mini-games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score }),
  });

  if (!response.ok) {
    throw new Error("Failed to update score");
  }

  return response.json();
}

export default function SudokuGame({
  dictionary,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["earn-tab"]["mini-games-tab"];
}) {
  const [gameState, setGameState] = useState<
    "selecting" | "playing" | "completed"
  >("selecting");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakeHighlight, setMistakeHighlight] = useState<number | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const initTelData = useInitData();
  const telegramId = initTelData?.user?.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ score }: { score: number }) =>
      updateUserScore(telegramId!, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        // title: `${dictionary.sudoku["toast-success"].title}`,
        description: `${dictionary.sudoku["toast-success"].description}`,
        duration: 3000,
        className: "bg-green-600 text-white",
      });
      setShowRewardModal(false);
      resetGame();
    },
    onError: (error: Error) => {
      console.error("Error updating score:", error);
      toast({
        // title: `${dictionary.sudoku["toast-failed"].title}`,
        description: `${dictionary.sudoku["toast-failed"].description}`,
        variant: "destructive",
        duration: 3000,
      });
    },
  });

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
    setShowRewardModal(true);
  };

  const saveScore = () => {
    mutation.mutate({ score });
  };

  const resetGame = () => {
    setGameState("selecting");
    setBoard([]);
    setInitialBoard([]);
    setSelectedCell(null);
    setMistakes(0);
    setTime(0);
    setScore(0);
    setMistakeHighlight(null);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 p-2 md:p-4'>
      {gameState === "selecting" && (
        <div className='flex flex-col items-center space-y-4 md:space-y-6'>
          <h2 className='text-xl md:text-3xl font-extrabold text-gray-800'>
            {dictionary.sudoku.select_ifficulty}
          </h2>
          <Select onValueChange={selectDifficulty}>
            <SelectTrigger className='w-[150px] md:w-[200px]'>
              <SelectValue
                placeholder={`${dictionary.sudoku.select_ifficulty}`}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='easy'>{dictionary.sudoku.easy}</SelectItem>
              <SelectItem value='medium'>{dictionary.sudoku.medium}</SelectItem>
              <SelectItem value='hard'>{dictionary.sudoku.hard}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(gameState === "playing" || gameState === "completed") && (
        <div className='space-y-4 md:space-y-6'>
          <div className='flex justify-between items-center'>
            <div className='text-base md:text-xl font-semibold'>
              {dictionary.sudoku.time}: {time}s
            </div>
            <p>{dictionary.sudoku[difficulty]}</p>
            <div className='text-base md:text-xl font-semibold text-red-600'>
              {dictionary.sudoku.mistakes}: {mistakes}
            </div>
          </div>

          <div
            className='grid grid-cols-9 gap-0.5 p-1 md:p-2 bg-white rounded-lg shadow-md'
            dir='ltr'
          >
            {board.map((cell, index) => (
              <div
                key={index}
                className={clsx(
                  "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm md:text-lg rounded cursor-pointer shadow transition-colors duration-300",
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

          <div className='grid grid-cols-9 gap-1 md:gap-2' dir='ltr'>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <Button
                key={num}
                onClick={() => handleNumberInput(num)}
                className='text-sm md:text-lg'
              >
                {num}
              </Button>
            ))}
          </div>

          {gameState === "completed" && (
            <div className='text-center space-y-2 md:space-y-4'>
              <h2 className='text-2xl md:text-3xl font-extrabold'>
                {dictionary.sudoku.game_completed}!
              </h2>
              <p className='text-lg md:text-xl'>
                {dictionary.sudoku.your_score}: {score / 1000}
              </p>
              <Button onClick={saveScore}>
                {dictionary.sudoku.save_score}
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dictionary.sudoku.dialog_title}!</DialogTitle>
            <DialogDescription>
              {dictionary.sudoku.dialog_description}!
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <p className='text-lg font-semibold'>
              {dictionary.sudoku.your_score}: {score / 1000}
            </p>
            <p>
              {dictionary.sudoku.time}: {time} {dictionary.sudoku.seconds}
            </p>
            <p>
              {dictionary.sudoku.mistakes}: {mistakes}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={saveScore} disabled={mutation.isPending}>
              {mutation.isPending
                ? `${dictionary.sudoku.button_saving}...`
                : `${dictionary.sudoku.button_save}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
