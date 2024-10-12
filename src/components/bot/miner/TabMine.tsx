"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchUserData, formatTimeMS } from "@/lib/utils";
import { Clock, Zap, ArrowUpCircle, Loader2 } from "lucide-react";
import { useInitData } from "@telegram-apps/sdk-react";
import { getDictionary } from "@/get-dictionary";

const startMining = async (
  telegramId: number | undefined
): Promise<{ user: User }> => {
  if (!telegramId) throw new Error("Telegram Id not provided");

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
  return data;
};

export default function TabMine({
  dictionary,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["mine-tab"];
}) {
  const initTelData = useInitData();
  const telegramId = initTelData?.user?.id;
  const [localScore, setLocalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId),
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const mutation = useMutation({
    mutationFn: () => startMining(telegramId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  useEffect(() => {
    if (data?.user) {
      setLocalScore(data.user.score ?? 0);
      setTimeRemaining(data.user.timeRemaining ?? 0);
      setIsMining(data.user.isMining ?? false);
    }
  }, [data]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMining) {
      const updateInterval = 100; // Update every 100 ms
      interval = setInterval(() => {
        const effectiveSpeed =
          data?.user?.effectiveSpeed || data?.user?.miningSpeed || 1;
        const scoreIncrement = (effectiveSpeed * 0.001 * updateInterval) / 1000; // Points per millisecond
        setLocalScore((prev) => prev + scoreIncrement);
        setTimeRemaining((prev) => Math.max(0, prev - updateInterval));
      }, updateInterval);
    }

    return () => clearInterval(interval);
  }, [isMining, data]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardHeader>
          <CardDescription>{dictionary.error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>
            {dictionary.error["try-again-button"]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const miningDuration = 4 * 60 * 60 * 1000; // 4 hours in ms
  const progress = ((miningDuration - timeRemaining) / miningDuration) * 100;

  const baseMiningSpeed =
    Number(data?.user?.miningSpeed) +
      Number(data?.user?.activeBoosts?.power?.multiplier) || 1;
  const effectiveSpeed = data?.user?.effectiveSpeed || baseMiningSpeed;
  const boostMultiplier =
    (data?.user?.effectiveSpeed &&
      data?.user?.effectiveSpeed -
        Number(data?.user?.activeBoosts?.power?.multiplier)) ||
    0;

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardContent className='space-y-6'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold'>{localScore.toFixed(4)}</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            {dictionary["total-score"]}
          </p>
        </div>
        <div className='relative flex items-center justify-center'>
          <svg className='w-40 h-40 -rotate-90'>
            <circle
              className='text-muted stroke-current'
              strokeWidth='8'
              fill='transparent'
              r='72'
              cx='80'
              cy='80'
            />
            <circle
              className='text-primary stroke-current'
              strokeWidth='8'
              strokeDasharray={2 * Math.PI * 72}
              strokeDashoffset={
                2 * Math.PI * 72 - (progress / 100) * 2 * Math.PI * 72
              }
              strokeLinecap='round'
              fill='transparent'
              r='72'
              cx='80'
              cy='80'
            />
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
            <p className='flex gap-1 items-center justify-center text-xl font-semibold'>
              <Clock className='h-6 w-6' /> {formatTimeMS(timeRemaining / 1000)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {dictionary["time-remaining"]}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4 text-center'>
          <div className='space-y-1'>
            <Zap className='h-6 w-6 mx-auto text-yellow-400' />
            <p className='text-lg font-semibold'>
              {baseMiningSpeed.toFixed(2)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {dictionary["mining-speed"]}
            </p>
          </div>
          <div className='space-y-1'>
            <ArrowUpCircle className='h-6 w-6 mx-auto text-green-400' />
            <p className='text-lg font-semibold'>
              {boostMultiplier.toFixed(2)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {dictionary["speed-boost"]}
            </p>
          </div>
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={isMining || mutation.isPending}
          className='w-full'
        >
          {isMining
            ? `${dictionary["button-progress"]}`
            : mutation.isPending
            ? `${dictionary["button-pending"]}...`
            : `${dictionary["button-start"]}`}
        </Button>
      </CardContent>
    </Card>
  );
}
