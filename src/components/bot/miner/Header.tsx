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
    refetchOnWindowFocus: false,
    refetchInterval: 600000,
  });

  const [level, setLevel] = useState(1);
  const totalLevels = 10;

  useEffect(() => {
    if (data?.user) {
      const user = data.user;
      setLevel(user.level);
    }
  }, [data]);

  return (
    <header className='bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-10'>
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
