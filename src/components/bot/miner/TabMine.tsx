import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Loader2, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInitData } from "@telegram-apps/sdk-react";
import { getDictionary } from "@/get-dictionary";
import { User } from "@/lib/types";
import { fetchUserData } from "@/lib/utils";

const startMining = async (
  telegramId: number | undefined
): Promise<{ user: User }> => {
  if (!telegramId) throw new Error("Telegram Id not provided");
  const response = await fetch(`/api/users/${telegramId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to start mining");
  return response.json();
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
  const queryClient = useQueryClient();

  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId),
    refetchInterval: 60000,
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
      const user = data.user;
      setScore(user.score);
      if (user.isMining) {
        const interval = setInterval(() => {
          const now = Date.now();
          const elapsed = now - user.lastMiningStart;
          const remaining = Math.max(4 * 60 * 60 * 1000 - elapsed, 0);
          setTimeLeft(remaining);
          setProgress((elapsed / (4 * 60 * 60 * 1000)) * 100);

          // Calculate the score incrementally only if we are within 4 hours
          if (elapsed < 4 * 60 * 60 * 1000) {
            // Calculate the score based on elapsed time
            const scoreIncrement = (elapsed * user.miningSpeed * 0.001) / 1000;
            const newScore = user.score + scoreIncrement; // Add the increment to the base score
            setScore(Number(newScore.toFixed(4))); // Update score to four decimal places
          }
        }, 100);
        return () => clearInterval(interval);
      } else {
        setTimeLeft(4 * 60 * 60 * 1000);
        setProgress(0);
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='text-center text-red-500'>
            {dictionary.error.message}
          </CardTitle>
        </CardHeader>
        <CardFooter className='flex justify-center'>
          <Button onClick={() => refetch()} variant='outline'>
            <RefreshCw className='mr-2 h-4 w-4' />
            {dictionary.error["try-again-button"]}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { user } = data;

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const scoreString = score.toFixed(4).toString();

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-center'>
          <div className='flex justify-center mt-2 w-full text-3xl font-bold'>
            {scoreString}
          </div>
          <span className='text-muted-foreground text-sm'>
            {dictionary["total-score"]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='relative w-48 h-48 mx-auto'>
          <svg className='w-full h-full transform -rotate-90'>
            <circle
              className='text-muted-foreground'
              strokeWidth='8'
              stroke='currentColor'
              fill='transparent'
              r='88'
              cx='96'
              cy='96'
            />
            <circle
              className='text-primary'
              strokeWidth='8'
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * ((100 - progress) / 100)}
              strokeLinecap='round'
              stroke='currentColor'
              fill='transparent'
              r='88'
              cx='96'
              cy='96'
            />
          </svg>
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center'>
            <div className='text-2xl font-bold'>{formatTime(timeLeft)}</div>
            <span className='text-muted-foreground text-xs'>
              {dictionary["time-remaining"]}
            </span>
          </div>
        </div>

        <div className='text-center text-lg'>
          {dictionary["mining-speed"]}:{" "}
          <span className='font-semibold text-primary'>
            {user.miningSpeed.toFixed(2)}
          </span>{" "}
          {dictionary["speed-boost"]}
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={user.isMining || mutation.isPending}
          className='w-full'
        >
          {user.isMining ? (
            <svg className='w-6 h-6' viewBox='0 0 50 50'>
              <circle
                className='ripple1'
                cx='25'
                cy='25'
                r='0'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
              />
              <circle
                className='ripple2'
                cx='25'
                cy='25'
                r='0'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
              />
              <circle
                className='ripple3'
                cx='25'
                cy='25'
                r='0'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
              />
            </svg>
          ) : mutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Play className='mr-2 h-4 w-4' />
          )}
          {user.isMining
            ? dictionary["button-progress"]
            : mutation.isPending
            ? dictionary["button-pending"]
            : dictionary["button-start"]}
        </Button>
      </CardContent>
      <CardFooter>
        <p className='text-center m-auto text-sm text-muted-foreground'>
          {user.isMining
            ? dictionary["description-progress"]
            : dictionary["description"]}
          .
        </p>
      </CardFooter>
    </Card>
  );
}
