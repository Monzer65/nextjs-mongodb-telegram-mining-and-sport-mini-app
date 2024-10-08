"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { BoosterId } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { Loader2 } from "lucide-react";
import { fetchUserData, formatTimeMS } from "@/lib/utils";
import { boosters } from "@/lib/static-data";

export default function TabBoost() {
  const queryClient = useQueryClient();
  const initTelData = useInitData();
  const telegramId = initTelData?.user?.id;

  const {
    data: userData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId),
  });

  const mutation = useMutation({
    mutationFn: activateBooster,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      toast({
        title: "Booster Activated",
        description: "Your booster has been successfully activated!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate booster. Please try again later.",
        variant: "destructive",
      });
    },
  });

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
          <CardDescription>Error fetching user data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {Object.entries(boosters).map(([id, booster]) => {
        const boosterId = id as BoosterId;

        const activeBoost = userData?.data?.activeBoosts?.[boosterId];
        const isActive = !!activeBoost;
        const now = Date.now();
        const remainingTime = activeBoost ? activeBoost.expiresAt - now : 0;
        const cooldownTime =
          userData?.data?.boosterCooldowns?.[boosterId]?.expiresAt || 0;

        return (
          <Card key={id}>
            <CardHeader>
              <CardTitle>{booster.name}</CardTitle>
              <CardDescription>
                Multiplier: x{booster.multiplier}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cost: {booster.cost} tokens</p>
              <p>Duration: {formatTimeMS(booster.duration)}</p>
              <p>Cooldown: {formatTimeMS(booster.cooldown)}</p>
              {isActive && (
                <p>
                  Remaining Active Time:{" "}
                  {formatTimeMS(Math.max(remainingTime / 1000, 0))}{" "}
                  {/* convert milliseconds to seconds */}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  if (!telegramId) return;
                  mutation.mutate({ telegramId, boosterId });
                }}
                disabled={
                  isActive ||
                  cooldownTime > 0 ||
                  (userData?.data?.score || 0) < booster.cost
                }
              >
                {isActive
                  ? `Active (${formatTimeMS(
                      Math.max(remainingTime / 1000, 0)
                    )})` // Show remaining active time in button
                  : cooldownTime > 0
                  ? `Cooldown (${formatTimeMS(
                      Math.max(cooldownTime / 1000, 0)
                    )})`
                  : "Activate"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
      <div className='col-span-full text-center mt-4'>
        <p className='text-xl font-bold'>
          Your Score: {userData?.data?.score || 0} tokens
        </p>
      </div>
    </div>
  );
}

const activateBooster = async ({
  telegramId,
  boosterId,
}: {
  telegramId: number;
  boosterId: BoosterId;
}) => {
  const response = await fetch(`/api/users/${telegramId}/boost`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boosterId }),
  });
  if (!response.ok) {
    throw new Error("Failed to activate booster");
  }
  return response.json();
};
