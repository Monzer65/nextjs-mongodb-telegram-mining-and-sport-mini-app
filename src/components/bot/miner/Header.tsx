"use client";
import { Badge } from "@/components/ui/badge";
import Username from "@/components/Username";
import { getDictionary } from "@/get-dictionary";
import { User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Header({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["miner"]["header"];
}) {
  const { data } = useQuery<{ user: User }>({
    queryKey: ["user"],
    refetchInterval: 60000,
  });

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const totalLevels = 10;

  useEffect(() => {
    if (data?.user) {
      const user = data.user;
      setScore(user.score);
    }
  }, [data]);

  useEffect(() => {
    const levelThresholds = [
      0, // Level 1: 0 points
      10000, // Level 2: 10,000 points
      50000, // Level 3: 50,000 points
      200000, // Level 4: 200,000 points
      500000, // Level 5: 500,000 points
      1000000, // Level 6: 1,000,000 points
      5000000, // Level 7: 5,000,000 points
      10000000, // Level 8: 10,000,000 points
      20000000, // Level 9: 20,000,000 points
      50000000, // Level 10: 50,000,000 points
    ];
    // Update level based on score whenever score changes
    const newLevel =
      levelThresholds.findIndex((threshold) => score < threshold) ||
      totalLevels;
    setLevel(newLevel);
  }, [score]);

  console.log(score);
  return (
    <header className='bg-gray-900 text-white p-4 flex justify-between items-center'>
      <div>
        <h2 className='text-xl font-semibold leading-none tracking-tight text-purple-800'>
          ScoreBoard Miner
        </h2>
        <p className='text-sm text-muted-foreground'>
          {dictionary.welcome} <Username />
        </p>
      </div>
      <Badge variant='outline' className='block bg-yellow-200 text-yellow-700'>
        {dictionary.level} {level} / {totalLevels}
      </Badge>
    </header>
  );
}
