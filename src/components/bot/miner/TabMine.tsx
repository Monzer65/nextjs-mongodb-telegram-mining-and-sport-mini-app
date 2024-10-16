import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
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
import { fetchUserData, formatTime } from "@/lib/utils";
import ProgressCircle from "./ProgressCircle";
import AnimatedRipple from "./Ripple";

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
  const [permanentSpeed, setPermanentSpeed] = useState(0);
  const [temporarySpeed, setTemporarySpeed] = useState(0);

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

      // Calculate the permanent speed (based on power booster)
      const baseSpeed = user.miningSpeed;
      const powerMultiplier = user.boosters.power.multiplier;
      const permanentSpeedValue = baseSpeed * powerMultiplier;
      setPermanentSpeed(permanentSpeedValue);

      // Calculate the temporary speed (multipliers from active boosters)
      let temporarySpeedMultiplier = 1;
      const now = Date.now();
      user.boosters.activeBoosters.forEach((booster) => {
        if (booster.expiresAt && new Date(booster.expiresAt).getTime() > now) {
          temporarySpeedMultiplier *= booster.multiplier;
        }
      });

      const temporarySpeedValue = baseSpeed * (temporarySpeedMultiplier - 1);
      setTemporarySpeed(temporarySpeedValue);

      const combinedSpeed = permanentSpeedValue + temporarySpeedValue;
      // Handle the mining session and time left
      if (user.isMining) {
        const interval = setInterval(() => {
          const now = Date.now();
          const elapsed = now - user.lastMiningStart;
          const remaining = Math.max(4 * 60 * 60 * 1000 - elapsed, 0);
          setTimeLeft(remaining);
          setProgress((elapsed / (4 * 60 * 60 * 1000)) * 100);

          // Calculate the score incrementally only if we are within 4 hours
          if (elapsed < 4 * 60 * 60 * 1000) {
            const scoreIncrement = (elapsed * combinedSpeed * 0.001) / 1000;
            const newScore = user.score + scoreIncrement;
            setScore(Number(newScore.toFixed(4)));
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

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-center'>
          <div className='flex justify-center mt-2 w-full text-3xl font-bold'>
            {score.toFixed(4)}
          </div>
          <span className='text-muted-foreground text-sm'>
            {dictionary["total-score"]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='relative w-48 h-48 mx-auto'>
          {/* Progress Circle */}
          <ProgressCircle progress={progress} />
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center'>
            <div className='text-2xl font-bold'>{formatTime(timeLeft)}</div>
            <span className='text-muted-foreground text-xs'>
              {dictionary["time-remaining"]}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <SpeedCard
            title={dictionary["permanent-speed"]}
            speed={permanentSpeed}
          />
          <SpeedCard
            title={dictionary["temporary-speed"]}
            speed={temporarySpeed}
          />
        </div>

        {/* Mining Control Button */}
        <Button
          onClick={() => mutation.mutate()}
          disabled={user.isMining || mutation.isPending}
          className='w-full'
        >
          {user.isMining ? (
            <AnimatedRipple />
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

function SpeedCard({ title, speed }: { title: string; speed: number }) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='bg-primary/10 py-2'>
        <CardTitle className='text-center text-sm font-medium'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <div className='text-center text-2xl font-bold'>{speed.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
