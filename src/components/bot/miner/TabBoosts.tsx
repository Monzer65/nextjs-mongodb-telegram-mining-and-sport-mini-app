"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useRef } from "react";
import { useInitData } from "@telegram-apps/sdk-react";
import { Booster, User, UserBooster } from "@/lib/types";
import { boosters } from "@/lib/static-data";
import { fetchUserData, formatTimeInMinutes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCcw } from "lucide-react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import FortuneSpinner from "./FortuneSpinner";

type Timestamp = number;
type BoosterId = "speed" | "power" | "fortune";

// Move API call to a separate function for better separation of concerns
const activateBooster = async (
  telegramId: number,
  boosterId: string,
  randomMultiplier: number
): Promise<any> => {
  const response = await fetch(`/api/users/${telegramId}/boost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boosterId, randomMultiplier }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to activate booster");
  }
  return response.json();
};

// Memoize these functions to prevent unnecessary recalculations

export default function TabBoosts({
  dictionary,
  lang,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["earn-tab"]["boosts-tab"];
  lang: Locale;
}) {
  const initTelData = useInitData();
  const telegramId = initTelData?.user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [now, setNow] = useState<Timestamp>(Date.now());
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const spinnerRef = useRef<HTMLDivElement>(null);

  const segments = [
    { label: "0", color: "#e57373", angle: "0" },
    { label: "1", color: "#f06292", angle: "36" },
    { label: "2", color: "#ba68c8", angle: "72" },
    { label: "3", color: "#9575cd", angle: "108" },
    { label: "4", color: "#7986cb", angle: "144" },
    { label: "5", color: "#64b5f6", angle: "180" },
    { label: "6", color: "#4db6ac", angle: "216" },
    { label: "7", color: "#81c784", angle: "252" },
    { label: "8", color: "#ffb74d", angle: "288" },
    { label: "9", color: "#ff8a65", angle: "324" },
    { label: "10", color: "#ff0000", angle: "360" },
  ];

  const { data, isLoading, isError, refetch } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId!),
    refetchInterval: 60000,
    enabled: !!telegramId,
  });

  const mutation = useMutation({
    mutationFn: ({
      boosterId,
      randomMultiplier,
    }: {
      boosterId: string;
      randomMultiplier: number;
    }) => activateBooster(telegramId!, boosterId, randomMultiplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: dictionary["toast-success-active"].title,
        description: dictionary["toast-success-active"].description,
      });
    },
    onError: (error: Error) => {
      toast({
        title: dictionary["toast-failed-active"].title,
        description: `${dictionary["toast-failed-active"].description}: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const calculateMultiplier = useMemo(
    () =>
      (booster: Booster, userBooster: UserBooster | undefined): number => {
        if (booster.id === "fortune") {
          return 1; // Use the random multiplier from the API response
        }

        if (booster.id === "power" && userBooster?.level !== undefined) {
          return 1 + (booster.speedIncrement || 0) * userBooster.level;
        }

        return 8;
      },
    []
  );

  const calculateBoosterCost = useMemo(
    () => (booster: Booster, userBooster: UserBooster | undefined) => {
      if (booster.id === "power" && userBooster) {
        const nextLevel = (userBooster.level || 0) + 1;
        return (
          booster.cost *
          Math.pow(booster.upgradeCostFactor || 1.1, nextLevel - 1)
        );
      }
      return booster.cost;
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (spinnerRef.current) {
      spinnerRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [rotation]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardHeader>
          <CardDescription>{dictionary.error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>
            <RefreshCcw className='w-5 mr-2' />
            {dictionary.error["try-again-button"]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { user } = data;

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    const spinDuration = 5000; // 5 seconds
    const finalResult = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    const finalRotation = 1800 + (finalResult - 1) * (360 / segments.length);

    // Smooth acceleration and deceleration
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    let start: number | null = null;
    const animate = (time: number) => {
      if (start === null) start = time;
      const elapsed = time - start;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easedProgress = easeInOutCubic(progress);

      setRotation(easedProgress * finalRotation);
      // const spin = Math.floor(3600 + Math.random() * 360);
      // setRotation(rotation + spin);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setResult(finalResult);
        setSpinning(false);
        // Trigger mutation with the correct randomMultiplier
        mutation.mutate({
          boosterId: "fortune",
          randomMultiplier: finalResult,
        });
      }
    };

    requestAnimationFrame(animate);
  };
  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader className='border-b mb-4'>
        <CardDescription>{dictionary["header-description"]}</CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {boosters.map((booster: Booster) => {
          const activeBooster = user.boosters.activeBoosters.find(
            (b) => b.id === booster.id
          );
          const cooldown = user.boosters.cooldowns[booster.id];
          const cooldownDate = cooldown ? new Date(cooldown) : null;
          const isActive =
            activeBooster?.expiresAt &&
            new Date(activeBooster.expiresAt).getTime() > now;
          const isOnCooldown =
            cooldown &&
            new Date(cooldown).getTime() + booster.cooldownDuration! > now;

          const userBooster = user.boosters[
            booster.id as keyof typeof user.boosters
          ] as UserBooster | undefined;
          const multiplier = calculateMultiplier(booster, userBooster);
          const level = userBooster?.level || 0;
          const maxLevel = booster.maxLevel || Infinity;
          const boosterCost = calculateBoosterCost(booster, userBooster);
          const segmentAngle = 360 / segments.length;

          if (booster.id === "fortune") {
            return (
              <Card key={booster.id} className='w-full max-w-sm mx-auto'>
                <CardHeader>
                  <CardTitle>{dictionary["fortune"]}</CardTitle>
                  <CardDescription>{dictionary.free}</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col flex-grow'>
                  <div className='relative w-48 h-48 mb-4'>
                    {/* Spinner container */}
                    <div
                      className='absolute w-full h-full rounded-full border-4 border-primary transition-transform duration-[5000ms] ease-in-out'
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      {/* Segments */}
                      {segments.map((segment, index) => (
                        <div
                          key={index}
                          className='absolute w-full h-full overflow-auto border-t border-t-white'
                          style={{
                            transform: `rotate(${index * segmentAngle}deg)`,
                            clipPath: "polygon(36% 0, 50% 50%, 64% 0)",
                            backgroundColor: segment.color,
                          }}
                        >
                          <div className='absolute top-2 left-1/2 -translate-x-1/2 text-2xl z-50 text-black'>
                            <span className='font-bold'>{segment.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Small circle in the middle */}
                    <div className='absolute w-12 h-12 rounded-full bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10' />

                    {result !== null && (
                      <p className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold z-50'>
                        {result}
                      </p>
                    )}
                  </div>

                  <div className='space-y-4 mt-auto'>
                    <div className='h-8'>
                      {renderProgressBar(
                        !!isActive,
                        activeBooster,
                        !!isOnCooldown,
                        cooldownDate,
                        booster,
                        now,
                        dictionary
                      )}
                    </div>
                    <Button
                      onClick={handleSpin}
                      disabled={
                        spinning ||
                        mutation.isPending ||
                        isActive ||
                        isOnCooldown
                      }
                      className='w-full'
                    >
                      {isActive
                        ? dictionary.active
                        : isOnCooldown
                        ? dictionary.on_cooldown
                        : dictionary.activate}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          } else {
            return (
              <Card key={booster.id} className='flex flex-col h-full'>
                <CardHeader>
                  <CardTitle>{dictionary[booster.id as BoosterId]}</CardTitle>
                  <CardDescription>
                    {boosterCost > 0
                      ? `${dictionary.cost}: ${boosterCost}`
                      : dictionary.free}
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col flex-grow'>
                  <div className='space-y-2 mb-4'>
                    <p>
                      {dictionary.multiplier}:{" "}
                      {booster.id !== "fortune"
                        ? multiplier.toFixed(2) + "x"
                        : dictionary.random}
                    </p>
                    {booster.level !== undefined && (
                      <p>
                        {dictionary.level}: {level} / {maxLevel}
                      </p>
                    )}
                  </div>
                  <div className='space-y-4 mt-auto'>
                    <div className='h-8'>
                      {renderProgressBar(
                        !!isActive,
                        activeBooster,
                        !!isOnCooldown,
                        cooldownDate,
                        booster,
                        now,
                        dictionary
                      )}
                    </div>

                    <Button
                      onClick={() =>
                        mutation.mutate({
                          boosterId: booster.id,
                          randomMultiplier: 0,
                        })
                      }
                      disabled={
                        isActive ||
                        isOnCooldown ||
                        mutation.isPending ||
                        (booster.id === "power" && level >= maxLevel)
                      }
                      className='w-full'
                    >
                      {isActive
                        ? dictionary.active
                        : isOnCooldown
                        ? dictionary.on_cooldown
                        : booster.id === "power" && level >= maxLevel
                        ? dictionary.max_level
                        : dictionary.activate}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </CardContent>
    </Card>
  );
}

// Helper function to render progress bar with corrected direction and remaining time display
export function renderProgressBar(
  isActive: boolean,
  activeBooster: any,
  isOnCooldown: boolean,
  cooldownDate: Date | null,
  booster: Booster,
  now: number,
  dictionary: any
) {
  if (isActive && activeBooster?.expiresAt && activeBooster?.lastUsed) {
    const duration =
      new Date(activeBooster.expiresAt).getTime() -
      new Date(activeBooster.lastUsed).getTime();
    const timeRemaining = new Date(activeBooster.expiresAt).getTime() - now;
    const progress = ((duration - timeRemaining) / duration) * 100;

    return (
      <div className='mb-2'>
        <p className='flex justify-between'>
          <span>{dictionary.active_duration}</span>
          <span> {formatTimeInMinutes(timeRemaining)}</span>
        </p>
        <Progress value={progress} className='mt-2' />
      </div>
    );
  } else if (isOnCooldown && cooldownDate) {
    const cooldownEnd = cooldownDate.getTime() + booster.cooldownDuration!;
    const timeRemaining = cooldownEnd - now;
    const progress =
      ((booster.cooldownDuration! - timeRemaining) /
        booster.cooldownDuration!) *
      100;

    return (
      <div className='mb-2'>
        <p className='flex justify-between'>
          <span>{dictionary.cooldown}</span>
          <span> {formatTimeInMinutes(timeRemaining)}</span>
        </p>
        <Progress value={progress} className='mt-2' />
      </div>
    );
  }

  return null;
}
