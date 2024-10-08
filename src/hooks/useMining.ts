import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function useMining(user: any, miningDuration: number) {
  const [isMining, setIsMining] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);

  // Create a mutation for updating the score
  const { mutate: updateScore } = useMutation({
    mutationFn: async (newScore: number) => {
      if (!user?.telegramId) throw new Error("No Telegram ID available");

      const response = await fetch(`/api/users/${user.telegramId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: newScore,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update score");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (!user || !user.lastMiningStart || typeof user.score !== "number")
      return;

    const currentTime = new Date().getTime();
    const startTimestamp = new Date(user.lastMiningStart).getTime();
    const elapsedTime = currentTime - startTimestamp;
    const userScore = user.score;

    if (elapsedTime < miningDuration) {
      setIsMining(true);
      setTimeRemaining(
        Math.max(0, Math.ceil((miningDuration - elapsedTime) / 1000))
      );
      setProgress(Math.min(elapsedTime / miningDuration, 1));
      setScore(userScore);
    } else {
      setIsMining(false);
      setProgress(0);
      setTimeRemaining(0);
    }
  }, [user, miningDuration]);

  // Update the score incrementally every second
  useEffect(() => {
    if (isMining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
        setScore((prevScore) => prevScore + 1); // Adjust this increment logic based on your needs
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isMining, timeRemaining]);

  // Persist the score to the database when the component unmounts or when mining ends
  useEffect(() => {
    const saveScore = () => {
      if (score > 0) {
        updateScore(score);
      }
    };

    // Save the score when mining stops
    if (!isMining && score > 0) {
      saveScore();
    }

    // Save the score when the component unmounts
    return () => {
      saveScore();
    };
  }, [isMining, score, updateScore]);

  return { isMining, timeRemaining, progress, score, setIsMining };
}
