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

  const [now, setNow] = useState(Date.now());

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
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
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

        return (
          <Card key={booster.id}>
            <CardHeader>
              <CardTitle>
                {booster.id === "speed" && dictionary.speed}
                {booster.id === "power" && dictionary.power}
                {booster.id === "fortune" && dictionary.fortune}
              </CardTitle>
              <CardDescription>
                {booster.cost > 0
                  ? `${dictionary.cost}: ${booster.cost}`
                  : dictionary.free}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='mb-2'>
                {dictionary.multiplier}:{" "}
                {typeof booster.multiplier === "function"
                  ? `${dictionary.random} (1x - 3x)`
                  : `${booster.multiplier}x`}
              </p>
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
                disabled={isActive || isOnCooldown || mutation.isPending}
                className='w-full mt-2'
              >
                {isActive
                  ? dictionary.active
                  : isOnCooldown
                  ? dictionary.on_cooldown
                  : dictionary.activate}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
