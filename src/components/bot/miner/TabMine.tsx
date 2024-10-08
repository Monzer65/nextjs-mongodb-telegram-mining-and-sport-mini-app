"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchUserData, formatTimeMS } from "@/lib/utils";
import { ArrowUpCircle, Clock } from "lucide-react";

// Patch request to start mining
const startMining = async (telegramId: number): Promise<User> => {
  const response = await fetch(`/api/users/${telegramId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to start mining");
  }
  const data = await response.json();
  return data.user;
};

export default function TabMine({ telegramId }: { telegramId: number }) {
  const [localScore, setLocalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user data with react-query
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery<{ user: User }>({
    queryKey: ["user", telegramId],
    queryFn: () => fetchUserData(telegramId),
  });

  useEffect(() => {
    if (userData?.user) {
      setLocalScore(userData.user.score ?? 0);
      setTimeRemaining(userData.user.timeRemaining ?? 0);
      setIsMining(userData.user.isMining ?? false);
    }
  }, [userData]);

  // Handle real-time mining score updates
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMining && userData?.user) {
      interval = setInterval(() => {
        const miningSpeed = userData.user.miningSpeed || 1; // Base mining speed
        const effectiveSpeed = userData.user.effectiveSpeed || miningSpeed;
        const lastScoreUpdate = userData.user.lastScoreUpdate ?? Date.now();
        const miningTimeElapsed = Date.now() - lastScoreUpdate;

        // 0.0000001 points per millisecond for base mining speed of 1
        const scoreIncrement = miningTimeElapsed * effectiveSpeed * 0.0000001;
        const newScore = localScore + scoreIncrement;

        setLocalScore(newScore);
        setTimeRemaining((prev) => Math.max(0, prev - 1000)); // Decrease time remaining by 1 second
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isMining, userData, localScore]);

  // Handle start mining action
  const handleStartMining = async () => {
    try {
      await startMining(telegramId);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (error) {
      console.error("Failed to start mining:", error);
    }
  };

  if (isLoading) return <div className='text-center p-4'>Loading...</div>;
  if (isError)
    return (
      <div className='text-center p-4 text-red-500'>
        Error fetching user data
      </div>
    );

  // Calculate progress for the progress bar
  const miningDuration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const progress = ((miningDuration - timeRemaining) / miningDuration) * 100;

  // Calculate effective speed and boost multiplier
  const baseMiningSpeed = userData?.user?.miningSpeed || 1;
  const effectiveSpeed = userData?.user?.effectiveSpeed || baseMiningSpeed;
  const boostMultiplier = effectiveSpeed / baseMiningSpeed;

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold text-center'>
          Mining Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='text-center'>
          <p className='text-3xl font-semibold'>{localScore.toFixed(6)}</p>
          <p className='text-sm text-muted-foreground'>Current Score</p>
        </div>

        <div className='relative pt-1'>
          <Progress value={progress} className='h-4' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <p className='text-xs font-medium'>
              <Clock className='inline-block w-4 h-4 mr-1' />
              {formatTimeMS(timeRemaining / 1000)}
            </p>
          </div>
        </div>

        <div className='text-center space-y-2'>
          <p className='text-sm font-medium'>
            Base Mining Speed: {baseMiningSpeed} (
            {(effectiveSpeed * 0.000001).toFixed(6)} points/ms)
          </p>
          <p className='text-sm font-medium'>
            Effective Mining Speed: X{effectiveSpeed}
          </p>
          {boostMultiplier > 1 && (
            <p className='text-sm text-muted-foreground'>
              <ArrowUpCircle className='inline-block w-4 h-4 mr-1' />
              Speed Boost: x{boostMultiplier.toFixed(2)}
            </p>
          )}
        </div>

        <Button
          onClick={handleStartMining}
          disabled={isMining}
          className='w-full'
        >
          {isMining ? "Mining in Progress" : "Start Mining"}
        </Button>
      </CardContent>
    </Card>
  );
}
