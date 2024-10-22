import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Search, RefreshCw, Loader2 } from "lucide-react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { useQuery } from "@tanstack/react-query";

async function fetchLeaderboard(telegramId: number | null, limit: number) {
  if (!telegramId) {
    return null;
  }
  const response = await fetch(
    `/api/users/leaderboard?telegramId=${telegramId}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return response.json();
}

export default function TabLeaderboard({
  dictionary,
  lang,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["leaderboard-tab"];
  lang: Locale;
}) {
  const initData = useInitData();
  const telegramId = initData?.user?.id || null;
  let limit: number = 10;

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["leaderboard", telegramId, limit],
    queryFn: () => fetchLeaderboard(telegramId, limit),
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
    enabled: !!telegramId,
    retry: 3,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState();
  const [userScore, setUserScore] = useState();

  useEffect(() => {
    if (data) {
      setLeaderboard(data.leaderboard);
      setUserRank(data.userRank);
      setUserScore(data.userScore);
    }
  }, [data]);

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
          <CardTitle>{dictionary.leaderboard}</CardTitle>
          <CardDescription>{dictionary.error["message"]}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>
            {dictionary.error["try-again-button"]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            {/* <CardTitle className='text-2xl font-bold'>
              {dictionary.leaderboard}
            </CardTitle> */}
            <CardDescription>{dictionary.header_description}</CardDescription>
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className='h-4 w-4' />
            <span className='sr-only'>refresh leaderboard</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLeaderboard.length === 0 ? (
          <p className='text-center py-4'>{dictionary.No_players_found}</p>
        ) : (
          <ScrollArea className='h-[400px] rounded-md border'>
            <Table className={``}>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>{dictionary.rank}</TableHead>
                  <TableHead>{dictionary.player}</TableHead>
                  <TableHead className='text-right'>
                    {dictionary.score}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaderboard.map((player: any, index: number) => {
                  // If the user's rank is greater than 10, add a separator before displaying the user.
                  if (userRank && userRank > 10 && index === 10) {
                    return (
                      <React.Fragment key='user-rank-separator'>
                        <TableRow className='hover:bg-muted/50'>
                          <TableCell colSpan={3} className='text-center'>
                            . . .
                          </TableCell>
                        </TableRow>
                        <TableRow
                          key={player.telegramId}
                          className={`hover:bg-muted/50 ${
                            player.telegramId === telegramId
                              ? "font-bold bg-red-100"
                              : ""
                          }`}
                        >
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {getRankIcon(userRank)}
                              <Badge
                                variant={
                                  userRank <= 3 ? "default" : "secondary"
                                }
                              >
                                {userRank}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <Avatar className='w-8 h-8'>
                                <AvatarImage
                                  src={
                                    player.photoUrl || "/placeholder-user.jpg"
                                  }
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
                      </React.Fragment>
                    );
                  }

                  // Show players directly if their rank is less than or equal to 10.
                  if (index < 10 || player.telegramId === telegramId) {
                    return (
                      <TableRow
                        key={player.telegramId}
                        className={`hover:bg-muted/50 ${
                          player.telegramId === telegramId
                            ? "font-bold bg-green-100"
                            : ""
                        }`}
                      >
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getRankIcon(index + 1)}
                            <Badge
                              variant={index < 3 ? "default" : "secondary"}
                            >
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
                    );
                  }
                  return null;
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className='bg-muted/50'>
        {!userRank && !isLoading && (
          <p className='text-center w-full text-muted-foreground'>
            {dictionary.not_on_leaderboard}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
