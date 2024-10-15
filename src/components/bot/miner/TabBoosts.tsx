"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useInitData } from "@telegram-apps/sdk-react";
import { Booster, User, UserBooster } from "@/lib/types";
import { boosters } from "@/lib/static-data";
import { fetchUserData } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCcw } from "lucide-react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

type Timestamp = number;

const activateBooster = async (
  telegramId: number,
  boosterId: string
): Promise<any> => {
  const response = await fetch(`/api/users/${telegramId}/boost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boosterId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to activate booster");
  }
  return response.json();
};

const calculateMultiplier = (
  booster: Booster,
  userBooster: UserBooster | undefined
): number => {
  if (typeof booster.multiplier === "function") {
    return booster.multiplier();
  }

  if (booster.id === "power" && userBooster?.level !== undefined) {
    return 1 + (booster.speedIncrement || 0) * userBooster.level;
  }

  return booster.multiplier as number;
};

const calculateBoosterCost = (
  booster: Booster,
  userBooster: UserBooster | undefined
) => {
  if (booster.id === "power" && userBooster) {
    const nextLevel = (userBooster.level || 0) + 1;
    return (
      booster.cost * Math.pow(booster.upgradeCostFactor || 1.1, nextLevel - 1)
    );
  }
  return booster.cost;
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

  const { data, isLoading, isError, refetch } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId!),
    refetchInterval: 60000,
    enabled: !!telegramId,
  });

  const mutation = useMutation({
    mutationFn: ({ boosterId }: { boosterId: string }) =>
      activateBooster(telegramId!, boosterId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: `${dictionary["toast-success-active"].title}`,
        description: `${dictionary["toast-success-active"].description}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: `${dictionary["toast-failed-active"].title}`,
        description: `${dictionary["toast-failed-active"].description}: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const [now, setNow] = useState<Timestamp>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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
            <RefreshCcw className='w-5' />
            {dictionary.error["try-again-button"]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { user } = data;
  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader className='border-b'>
        <CardDescription>some descriptions</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 pt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
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
            cooldownDate &&
            cooldownDate.getTime() + booster.cooldownDuration! > now;

          let progress = 0;
          if (isActive && activeBooster?.expiresAt) {
            const duration =
              new Date(activeBooster.expiresAt).getTime() -
              new Date(activeBooster.lastUsed).getTime();
            const timeRemaining =
              new Date(activeBooster.expiresAt).getTime() - now;
            progress = (timeRemaining / duration) * 100;
          } else if (isOnCooldown && cooldownDate) {
            const cooldownEnd =
              cooldownDate.getTime() + booster.cooldownDuration!;
            const timeRemaining = cooldownEnd - now;
            progress = (timeRemaining / booster.cooldownDuration!) * 100;
          }

          const userBooster = user.boosters[
            booster.id as keyof typeof user.boosters
          ] as UserBooster | undefined;
          const multiplier = calculateMultiplier(booster, userBooster);
          const level = userBooster?.level || 0;
          const maxLevel = booster.maxLevel || Infinity;
          const boosterCost = calculateBoosterCost(booster, userBooster);

          return (
            <Card key={booster.id}>
              <CardHeader>
                <CardTitle>
                  {booster.id === "speed" && dictionary.speed}
                  {booster.id === "power" && dictionary.power}
                  {booster.id === "fortune" && dictionary.fortune}
                </CardTitle>
                <CardDescription>
                  {boosterCost > 0
                    ? `${dictionary.cost}: ${boosterCost}`
                    : dictionary.free}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='mb-2'>
                  {dictionary.multiplier}: {multiplier.toFixed(2)}x
                </p>
                {booster.level !== undefined && (
                  <p className='mb-2'>
                    {dictionary.level}: {level} / {maxLevel}
                  </p>
                )}
                {isActive && (
                  <div className='mb-2'>
                    <p>{dictionary.active_duration}</p>
                    <Progress value={progress} className='mt-2' />
                  </div>
                )}
                {isOnCooldown && (
                  <div className='mb-2'>
                    <p>{dictionary.cooldown}</p>
                    <Progress value={progress} className='mt-2' />
                  </div>
                )}
                <Button
                  onClick={() => mutation.mutate({ boosterId: booster.id })}
                  disabled={
                    isActive ||
                    isOnCooldown ||
                    mutation.isPending ||
                    (booster.id === "power" && level >= maxLevel)
                  }
                  className='w-full mt-2'
                >
                  {isActive
                    ? dictionary.active
                    : isOnCooldown
                    ? dictionary.on_cooldown
                    : booster.id === "power" && level >= maxLevel
                    ? dictionary.max_level
                    : dictionary.activate}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
