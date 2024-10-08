"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TabMine from "./TabMine";
import TabTasks from "./TabTasks";
import TabEarn from "./TabEarn";
import TabLeaderboard from "./TabLeaderboard";
import TabWallet from "./TabWallet";
import Header from "./Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDictionary } from "@/get-dictionary";
import { useInitData } from "@telegram-apps/sdk-react";
import { useAnimate } from "framer-motion";
import { Locale } from "@/i18n-config";

export const levelThresholds = [
  0, 1000, 5000, 10000, 20000, 21850, 21900, 21930, 22000, 22150,
];

export default function MinerContent({
  dictionary,
  lang,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["miner"];
  lang: Locale;
}) {
  const initTelegramData = useInitData();
  const telegramId = initTelegramData?.user?.id;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("mine");
  const [isMining, setIsMining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const [scope, animate] = useAnimate();
  const [level, setLevel] = useState(1);

  // Fetch user data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${telegramId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    },
    enabled: !!telegramId,
  });

  const calculateLevel = useCallback((currentScore: number) => {
    let currentLevel = 1;
    for (let i = 0; i < levelThresholds.length; i++) {
      if (currentScore >= levelThresholds[i]) {
        currentLevel = i + 1;
      }
    }
    return currentLevel;
  }, []);

  // Set data after fetching user info
  useEffect(() => {
    if (data && data.success) {
      const userData = data.user;
      setIsMining(userData.isMining);
      setTimeRemaining(userData.timeRemaining || 0);
      setProgress(1 - userData.timeRemaining / (4 * 60 * 60));
      setScore(userData.score || 0);

      const userLevel = calculateLevel(userData.score || 0);
      setLevel(userLevel);
    }
  }, [data, calculateLevel]);

  const updateLocalScoreAndTime = useCallback(() => {
    if (isMining) {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time has reached 0, trigger refetch
          refetch(); // Refetch user data
          return 0; // Reset time remaining
        }
        return prev - 1; // Decrease timeRemaining by 1 second
      });

      setScore((prev) => {
        if (timeRemaining > 0) {
          const newScore = prev + (1 * data?.data?.miningSpeed || 1); // Increment score based on mining speed

          // Update level based on the new score
          const newLevel = calculateLevel(newScore);
          setLevel(newLevel);

          return newScore;
        }

        // Return the previous score if timeRemaining is 0
        return prev;
      });
    }
  }, [isMining, data, calculateLevel, refetch, timeRemaining]);

  // Timer to update local time and score
  useEffect(() => {
    const interval = setInterval(updateLocalScoreAndTime, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [updateLocalScoreAndTime]);

  // Handle mining click
  const handleClick = async () => {
    try {
      const response = await fetch(`/api/users/${telegramId}`, {
        method: "PATCH", // Use PATCH for mining action
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Refetch data to update the mining status
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    } catch (error) {
      console.error("Mining failed", error);
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Header level={level} dictionary={dictionary.header} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='flex-1 p-4 mb-16'
        dir={lang === "en" ? "ltr" : "rtl"}
      >
        <TabsList className='flex justify-between sticky top-0 bg-slate-200 z-10'>
          <TabsTrigger value='mine'>{dictionary.tabs.titles.mine}</TabsTrigger>
          <TabsTrigger value='earn'>{dictionary.tabs.titles.earn}</TabsTrigger>
          <TabsTrigger value='leaderboard'>
            {dictionary.tabs.titles.leaderboard}
          </TabsTrigger>
          <TabsTrigger value='wallet'>
            {dictionary.tabs.titles.wallet}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='mine' className='flex-1 mt-4'>
          <TabMine
            // isMining={isMining}
            // progress={progress}
            // timeRemaining={timeRemaining}
            // handleClick={handleClick}
            // scope={scope}
            // currentScore={score}
            // dictionary={dictionary.tabs["mine-tab"]}
            telegramId={telegramId || 0}
          />
        </TabsContent>
        <TabsContent value='earn' className='flex-1 mt-4'>
          <TabEarn dictionary={dictionary.tabs["earn-tab"]} lang={lang} />
        </TabsContent>
        <TabsContent value='leaderboard' className='flex-1 mt-4'>
          <TabLeaderboard />
        </TabsContent>
        <TabsContent value='wallet' className='flex-1 mt-4'>
          <TabWallet />
        </TabsContent>
      </Tabs>
    </div>
  );
}
