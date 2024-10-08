"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DigForTokens() {
  const [grid, setGrid] = useState(Array(25).fill(null));
  const [tokens, setTokens] = useState(0);
  const [digsLeft, setDigsLeft] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Initialize the grid with random token values
    const newGrid = grid.map(() =>
      Math.random() < 0.3 ? Math.floor(Math.random() * 10) + 1 : 0
    );
    setGrid(newGrid);
  }, [grid]);

  const handleDig = (index: any) => {
    if (gameOver || grid[index] === null) return;

    const newGrid = [...grid];
    const dugTokens = newGrid[index];
    newGrid[index] = null;
    setGrid(newGrid);
    setTokens(tokens + dugTokens);
    setDigsLeft(digsLeft - 1);

    if (digsLeft === 1) {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setGrid(Array(25).fill(null));
    setTokens(0);
    setDigsLeft(3);
    setGameOver(false);
    const newGrid = Array(25)
      .fill(null)
      .map(() =>
        Math.random() < 0.3 ? Math.floor(Math.random() * 10) + 1 : 0
      );
    setGrid(newGrid);
  };

  return (
    <Card className='w-[300px]'>
      <CardHeader>
        <CardTitle>Dig for Tokens</CardTitle>
        <CardDescription>
          Click on tiles to dig for tokens. You have {digsLeft} digs left.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-5 gap-2'>
          {grid.map((cell, index) => (
            <Button
              key={index}
              onClick={() => handleDig(index)}
              disabled={cell === null || gameOver}
              variant={cell === null ? "ghost" : "outline"}
              className='w-12 h-12 p-0'
            >
              {cell === null ? "X" : "?"}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <div>Tokens earned: {tokens}</div>
        <Button onClick={resetGame} disabled={!gameOver}>
          {gameOver ? "Play Again" : "Reset"}
        </Button>
      </CardFooter>
    </Card>
  );
}
