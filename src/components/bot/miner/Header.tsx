"use client";
import { Badge } from "@/components/ui/badge";
import Username from "@/components/Username";
import { getDictionary } from "@/get-dictionary";

export default function Header({
  level,
  dictionary,
}: {
  level: number;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["miner"]["header"];
}) {
  const totalLevels = 10;

  return (
    <header className='bg-gray-900 text-white p-4 flex justify-between items-center'>
      <div>
        <h2 className='text xl font-semibold leading-none tracking-tight text-purple-800'>
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
