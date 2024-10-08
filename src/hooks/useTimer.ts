import { useState, useEffect, useCallback } from "react";

export function useTimer(
  lastMiningStart: string | undefined,
  miningDuration: number
) {
  const [isMining, setIsMining] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);

  const startMining = useCallback(() => {
    setIsMining(true);
    setTimeRemaining(miningDuration / 1000);
    setProgress(0);
  }, [miningDuration]);

  useEffect(() => {
    if (!lastMiningStart) return;

    const currentTime = new Date().getTime();
    const startTimestamp = new Date(lastMiningStart).getTime();
    const elapsedTime = currentTime - startTimestamp;

    if (elapsedTime < miningDuration) {
      setIsMining(true);
      setTimeRemaining(
        Math.max(0, Math.ceil((miningDuration - elapsedTime) / 1000))
      );
      setProgress(Math.min(elapsedTime / miningDuration, 1));
    } else {
      setIsMining(false);
      setProgress(0);
      setTimeRemaining(0);
    }
  }, [lastMiningStart, miningDuration]);

  useEffect(() => {
    if (isMining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1;
          setProgress(1 - newTime / (miningDuration / 1000));
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isMining, timeRemaining, miningDuration]);

  return { isMining, timeRemaining, progress, startMining };
}
