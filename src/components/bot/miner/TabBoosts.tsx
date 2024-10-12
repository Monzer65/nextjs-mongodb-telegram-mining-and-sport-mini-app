"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useInitData } from "@telegram-apps/sdk-react";
import { Booster, User, ActiveBoosts, BoosterCooldowns } from "@/lib/types";
import { boosters } from "@/lib/static-data";
import { fetchUserData } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ArrowUpIcon, BoltIcon, Loader2 } from "lucide-react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

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
  const [activeBoosters, setActiveBoosters] = useState<ActiveBoosts>({});
  const [boosterCooldowns, setBoosterCooldowns] = useState<BoosterCooldowns>(
    {}
  );
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId),
    refetchInterval: 60000,
    enabled: !!telegramId,
  });

  useEffect(() => {
    if (data?.user) {
      const currentTime = Date.now();
      const updatedBoosters = Object.entries(
        data.user.activeBoosts || {}
      ).reduce((acc, [boostType, boost]) => {
        if (
          boost &&
          (boostType === "power" ||
            (boost.expiresAt && currentTime < boost.expiresAt))
        ) {
          acc[boostType] = boost;
        }
        return acc;
      }, {} as ActiveBoosts);
      setActiveBoosters(updatedBoosters);
      setBoosterCooldowns(data.user.boosterCooldowns || {});
    }
  }, [data]);

  const activateBooster = useMutation({
    mutationFn: async ({ boosterId }: { boosterId: string }) => {
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
    },
    onSuccess: (data) => {
      setActiveBoosters((prev) => ({
        ...prev,
        [data.boosterId]: {
          multiplier: data.multiplier,
          expiresAt: data.expiresAt,
          level: data.level,
        },
      }));
      setBoosterCooldowns((prev) => ({
        ...prev,
        [data.boosterId]: {
          expiresAt: data.cooldownExpiresAt,
        },
      }));
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: `${dictionary["toast-success-active"].title}`,
        description: `${dictionary["toast-success-active"].description}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: `${dictionary["toast-failed-active"].title}`,
        description: `${dictionary["toast-failed-active"].description}`,
        variant: "destructive",
      });
    },
  });

  const handleActivateBooster = (booster: Booster) => {
    if (activeBoosters[booster.id] && booster.id !== "power") return;
    activateBooster.mutate({ boosterId: booster.id });
  };

  const calculateProgress = (expiresAt: number, duration: number) => {
    const now = Date.now();
    const elapsed = duration - (expiresAt - now);
    return Math.max(0, Math.min(100, (elapsed / duration) * 100));
  };

  const calculateUpgradeCost = (currentLevel: number): number => {
    return Math.floor(2 * Math.pow(1.5, currentLevel));
  };

  const formatMultiplier = (multiplier: number | (() => number)): string => {
    const value = typeof multiplier === "function" ? multiplier() : multiplier;
    return value.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardContent className='p-6'>
          <p className='text-center text-destructive mb-4'>
            {dictionary.error.message}
          </p>
          <Button onClick={() => refetch()} className='w-full'>
            {dictionary.error["try-again-button"]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='w-full max-w-3xl mx-auto grid gap-6 p-6 bg-background rounded-lg shadow-sm'>
      {boosters.map((booster) => {
        const isActive = !!activeBoosters[booster.id];
        const isCooldown =
          !!boosterCooldowns[booster.id] &&
          (boosterCooldowns[booster.id]?.expiresAt ?? 0) > Date.now();
        const multiplier =
          activeBoosters[booster.id]?.multiplier || booster.multiplier;
        const level = activeBoosters[booster.id]?.level || 1;
        const upgradeCost =
          booster.id === "power" ? calculateUpgradeCost(level) : booster.cost;
        const progress =
          isActive && booster.id !== "power" && booster.activeDuration
            ? calculateProgress(
                activeBoosters[booster.id].expiresAt!,
                booster.activeDuration
              )
            : 0;
        const isDisabled =
          (isActive && booster.id !== "power") ||
          isCooldown ||
          activateBooster.isPending ||
          (data?.user?.score ?? 0) < upgradeCost ||
          (!data?.user?.isMining && booster.id !== "power");

        return (
          <Card
            key={booster.id}
            className='overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300'
          >
            <CardContent className='p-0'>
              <div
                className={`p-6 text-primary-foreground ${
                  lang === "en" ? "bg-gradient-to-r" : "bg-gradient-to-l"
                } from-primary to-primary-foreground rounded-t-lg`}
              >
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-xl font-semibold tracking-tight'>
                    {booster.id === "speed" && dictionary.speed}
                    {booster.id === "power" && dictionary.power}
                    {booster.id === "fortune" && dictionary.fortune}
                  </h3>
                  {isActive && booster.id !== "power" && (
                    <Badge
                      variant='secondary'
                      className='bg-green-500 text-white'
                    >
                      {dictionary["badge-active"]}
                    </Badge>
                  )}
                  {isCooldown && (
                    <Badge
                      variant='secondary'
                      className='bg-destructive text-destructive-foreground'
                    >
                      {dictionary["badge-cooldown"]}
                    </Badge>
                  )}
                </div>
                {booster.id !== "fortune" && (
                  <div className='flex items-center gap-3'>
                    <BoltIcon className='w-5 h-5 text-yellow-400' />
                    <span className='text-base font-medium'>
                      x{formatMultiplier(multiplier)}
                    </span>
                  </div>
                )}
              </div>
              <div className='p-6 space-y-6 bg-card text-card-foreground'>
                {booster.id === "power" ? (
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                      <ArrowUpIcon className='w-5 h-5 text-blue-500' />
                      <span className='text-base font-medium'>
                        {dictionary.level} {level}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-base font-medium'>
                        {upgradeCost}
                      </span>
                      <span className='text-sm text-muted-foreground'>
                        {dictionary.points}
                      </span>
                    </div>
                  </div>
                ) : (
                  isActive &&
                  booster.activeDuration && (
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-base font-medium'>
                          {dictionary.duration}
                        </span>
                        <span className='text-sm text-muted-foreground'>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progress} className='h-2' />
                    </div>
                  )
                )}
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Button
                    onClick={() => handleActivateBooster(booster)}
                    disabled={isDisabled}
                    className='flex-1'
                    variant={
                      isActive && booster.id !== "power"
                        ? "secondary"
                        : isCooldown
                        ? "destructive"
                        : "default"
                    }
                  >
                    {booster.id === "power"
                      ? isActive
                        ? `${dictionary.upgrade}`
                        : `${dictionary.activate}`
                      : isActive
                      ? `${dictionary.active}`
                      : isCooldown
                      ? `${dictionary.cooldown}`
                      : `${dictionary.activate}`}
                  </Button>
                </div>
                {isDisabled && (
                  <p className='text-sm text-muted-foreground text-center'>
                    {isActive && booster.id !== "power"
                      ? `${dictionary["disable-already-active"]}`
                      : isCooldown
                      ? `${dictionary["disable-on-cooldown"]}`
                      : activateBooster.isPending
                      ? "Activating your booster..."
                      : (data?.user?.score ?? 0) < upgradeCost
                      ? `${dictionary["disable-not-enough-points"]}`
                      : `${dictionary["disable-start-mining-first"]}`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
