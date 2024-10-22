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

  const segments = [
    { label: "0", multiplier: 0 },
    { label: "1", multiplier: 1 },
    { label: "2", multiplier: 2 },
    { label: "3", multiplier: 3 },
    { label: "4", multiplier: 4 },
    { label: "5", multiplier: 5 },
    { label: "6", multiplier: 6 },
    { label: "7", multiplier: 7 },
    { label: "8", multiplier: 8 },
    { label: "9", multiplier: 9 },
    { label: "10", multiplier: 10 },
  ];

  const segmentAngle = 360 / segments.length;

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
        // title: dictionary["toast-success-active"].title,
        description: dictionary["toast-success-active"].description,
        className: "bg-green-600 text-white",
      });
    },
    onError: (error: Error) => {
      toast({
        // title: dictionary["toast-failed-active"].title,
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

  const spinWheel = () => {
    setSpinning(true);
    setRotation(0);
    setResult(null);

    setTimeout(() => {
      const randomRotation = Math.floor(Math.random() * 360) + 1080; // Spin at least 3 full rotations
      setRotation(randomRotation);

      setTimeout(() => {
        const finalRotation = randomRotation % 360;
        const exactSegmentIndex = (360 - finalRotation) / segmentAngle; // Calculate the exact segment index with decimal
        const selectedSegmentIndex = Math.floor(exactSegmentIndex);
        const selectedMultiplier = segments[selectedSegmentIndex].multiplier;
        const decimalPart = exactSegmentIndex - selectedSegmentIndex; // Extract decimal part
        const preciseResult = selectedMultiplier + decimalPart;
        setResult(preciseResult);
        setSpinning(false);

        mutation.mutate({
          boosterId: "fortune",
          randomMultiplier: preciseResult,
        });
      }, 3000); // Simulate a 3 second spin
    }, 0);
  };

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

          if (booster.id === "fortune") {
            return (
              <Card key={booster.id} className='w-full max-w-sm mx-auto'>
                <CardHeader>
                  <CardTitle>{dictionary["fortune"]}</CardTitle>
                  <CardDescription>{dictionary.free}</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col flex-grow'>
                  <div className='space-y-2 mb-4'>
                    <p>
                      {dictionary.multiplier}: {dictionary.random}
                    </p>
                  </div>
                  <div className='relative m-auto mb-2'>
                    <svg
                      width='200'
                      height='200'
                      viewBox='0 0 200 200'
                      style={{
                        transition: spinning ? "transform 3s ease-out" : "none",
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      {segments.map((segment, index) => {
                        const startAngle = index * segmentAngle;
                        const endAngle = startAngle + segmentAngle;
                        const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                        const startX =
                          100 +
                          100 * Math.cos((startAngle - 90) * (Math.PI / 180));
                        const startY =
                          100 +
                          100 * Math.sin((startAngle - 90) * (Math.PI / 180));
                        const endX =
                          100 +
                          100 * Math.cos((endAngle - 90) * (Math.PI / 180));
                        const endY =
                          100 +
                          100 * Math.sin((endAngle - 90) * (Math.PI / 180));

                        return (
                          <g key={index}>
                            <path
                              d={`M100,100 L${startX},${startY} A100,100 0 ${largeArcFlag},1 ${endX},${endY} Z`}
                              fill={`hsl(${index * 30}, 100%, 70%)`}
                              stroke='#000'
                            />
                            <text
                              x='100'
                              y='100'
                              fill='#000'
                              fontWeight='bold'
                              fontSize='14'
                              textAnchor='middle'
                              alignmentBaseline='middle'
                              transform={`rotate(${
                                startAngle + segmentAngle / 2
                              }, 100, 100) translate(0, -80)`}
                            >
                              {segment.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    {/* pointer */}
                    <div className='absolute top-[-10px] left-1/2 translate-x-[-50%] border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[20px] border-t-red-500' />
                    {/* middle circle */}
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-10 w-10 h-10 rounded-full flex items-center justify-center'>
                      {result !== null && (
                        <p className='font-bold'>{result.toFixed(2)}</p>
                      )}
                    </div>
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
                      onClick={spinWheel}
                      disabled={
                        spinning ||
                        isActive ||
                        isOnCooldown ||
                        mutation.isPending
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
                  <div className='space-y-4 mt-auto '>
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
          <span className='truncate'>{dictionary.active_duration}</span>
          <span className='truncate'>
            {" "}
            {formatTimeInMinutes(timeRemaining)}
          </span>
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
          <span className='truncate'>{dictionary.cooldown}</span>
          <span className='truncate'>
            {" "}
            {formatTimeInMinutes(timeRemaining)}
          </span>
        </p>
        <Progress value={progress} className='mt-2' />
      </div>
    );
  }

  return null;
}
