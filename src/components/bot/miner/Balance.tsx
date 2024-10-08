"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function MiningSection() {
  const [isMining, setIsMining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4 * 60 * 60); // 4 hours in seconds

  useEffect(() => {
    let timer: number | undefined;

    if (isMining && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isMining, timeLeft]);

  const startMining = () => {
    setIsMining(true);
  };

  return (
    <section className='text-center py-10'>
      {isMining ? (
        <div className='flex flex-col items-center'>
          {/* Standby element: animated pickaxe or coin */}
          <div className='animate-spin w-24 h-24 border-t-4 border-yellow-500 rounded-full mb-4'></div>
          <p className='text-lg'>Mining in progress...</p>
          <p className='text-lg'>Time Left: {formatTime(timeLeft)}</p>
        </div>
      ) : (
        <Button
          className='bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-4 text-xl'
          onClick={startMining}
        >
          Start Mining (4 hours)
        </Button>
      )}
    </section>
  );
}

// Helper function to format time from seconds to hh:mm:ss
const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};
