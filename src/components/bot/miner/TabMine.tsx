"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserData, formatTimeMS } from "@/lib/utils";
import { ArrowUpCircle } from "lucide-react";
import FlipCounter from "./FlipNumber";

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
  const queryClient = useQueryClient();

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId),
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const mutation = useMutation({
    mutationFn: async () => startMining(telegramId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  useEffect(() => {
    if (userData?.user) {
      setLocalScore(userData.user.score ?? 0);
      setTimeRemaining(userData.user.timeRemaining ?? 0);
    }
  }, [userData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (userData?.user?.isMining) {
      const updateInterval = 100; // Update every 100 ms
      interval = setInterval(() => {
        const effectiveSpeed =
          userData.user.effectiveSpeed || userData.user.miningSpeed || 1;
        const scoreIncrement = (effectiveSpeed * 0.001 * updateInterval) / 1000; // Points per millisecond
        setLocalScore((prev) => prev + scoreIncrement);
        setTimeRemaining((prev) => Math.max(0, prev - updateInterval));
      }, updateInterval);
    }

    return () => clearInterval(interval);
  }, [userData]);

  if (isLoading) return <div className='text-center p-4'>Loading...</div>;
  if (isError)
    return (
      <div className='text-center p-4 text-red-500'>
        Error fetching user data
      </div>
    );

  const miningDuration = 4 * 60 * 60 * 1000; // 4 hours in ms
  const progress = ((miningDuration - timeRemaining) / miningDuration) * 100;

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
          {localScore.toFixed(4)}
          <p className='text-sm text-muted-foreground mt-2'>Current Score</p>
        </div>

        <div className='relative flex items-center justify-center'>
          <svg className='w-48 h-48 transform -rotate-90'>
            <circle
              className='text-muted-foreground'
              strokeWidth='4'
              stroke='currentColor'
              fill='transparent'
              r='70'
              cx='96'
              cy='96'
            />
            <circle
              className='text-primary'
              strokeWidth='4'
              strokeDasharray={2 * Math.PI * 70} // circumference of circle
              strokeDashoffset={
                2 * Math.PI * 70 - (progress / 100) * 2 * Math.PI * 70
              }
              strokeLinecap='round'
              stroke='currentColor'
              fill='transparent'
              r='70'
              cx='96'
              cy='96'
            />
          </svg>
          <div className='absolute text-center'>
            <p className='text-2xl font-bold'>
              {formatTimeMS(timeRemaining / 1000)}
            </p>
            <p className='text-xs text-muted-foreground'>Remaining</p>
          </div>
        </div>

        <div className='text-center space-y-2'>
          <p className='text-sm font-medium'>
            Mining Speed: {effectiveSpeed} (
            {(effectiveSpeed * 0.001).toFixed(4)} points/s)
          </p>
          {boostMultiplier > 1 && (
            <p className='text-sm text-muted-foreground'>
              <ArrowUpCircle className='inline-block w-4 h-4 mr-1' />
              Speed Boost: x{boostMultiplier.toFixed(2)}
            </p>
          )}
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={userData?.user?.isMining || mutation.isPending}
          className='w-full'
        >
          {userData?.user?.isMining
            ? "Mining in Progress"
            : mutation.isPending
            ? "Starting..."
            : "Start Mining"}
        </Button>
      </CardContent>
    </Card>
  );
}
