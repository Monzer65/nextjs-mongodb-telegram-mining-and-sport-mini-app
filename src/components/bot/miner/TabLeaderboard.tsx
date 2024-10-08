"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useInitData } from "@telegram-apps/sdk-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Search, RefreshCw, Loader2 } from "lucide-react";

export default function TabLeaderboard() {
  const initData = useInitData();
  const telegramId = initData?.user?.id || null;
  const { leaderboard, userRank, userScore, isLoading, isError, refetch } =
    useLeaderboard(telegramId);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeaderboard = leaderboard.filter((player: any) =>
    player.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='w-5 h-5 text-yellow-500' />;
      case 2:
        return <Medal className='w-5 h-5 text-gray-400' />;
      case 3:
        return <Medal className='w-5 h-5 text-amber-600' />;
      default:
        return null;
    }
  };

  if (isError) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            An error occurred while loading the leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-2xl font-bold'>Leaderboard</CardTitle>
            <CardDescription>Top players by score</CardDescription>
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='mb-4'>
          <div className='relative'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search players...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
        </div>
        {isLoading ? (
          // skeleton loader
          // <div className='space-y-2'>
          //   {[...Array(5)].map((_, i) => (
          //     <Skeleton key={i} className='w-full h-12' />
          //   ))}
          // </div>
          <div className='flex items-center justify-center h-full'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <p className='text-center py-4'>No players found.</p>
        ) : (
          <ScrollArea className='h-[400px] rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className='text-right'>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaderboard.map((player: any, index: number) => (
                  <TableRow
                    key={player.telegramId}
                    className='hover:bg-muted/50'
                  >
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {getRankIcon(index + 1)}
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          {index + 1}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-8 h-8'>
                          <AvatarImage
                            src={player.photoUrl || "/placeholder-user.jpg"}
                            alt={`@${player.username}`}
                          />
                          <AvatarFallback>
                            {player.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-medium'>
                          {player.username || "Unknown Player"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-right font-semibold'>
                      {player.score !== undefined
                        ? player.score.toLocaleString()
                        : "No Score"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className='bg-muted/50'>
        {!userRank && !isLoading ? (
          <p className='text-center w-full text-muted-foreground'>
            You are not on the leaderboard yet.
          </p>
        ) : (
          <div className='w-full flex justify-between items-center'>
            <div>
              <p className='text-sm text-muted-foreground'>Your Rank</p>
              <p className='text-2xl font-bold'>{userRank}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Your Score</p>
              <p className='text-2xl font-bold'>
                {userScore !== undefined
                  ? userScore.toLocaleString()
                  : "No Score"}
              </p>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
