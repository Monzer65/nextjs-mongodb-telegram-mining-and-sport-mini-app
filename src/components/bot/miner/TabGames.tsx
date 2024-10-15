"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, ArrowLeft } from "lucide-react";
import SudokuGame from "./Sudoku";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import clsx from "clsx";

type Game = {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
};

const TabGames = ({
  dictionary,
  lang,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["earn-tab"]["mini-games-tab"];
  lang: Locale;
}) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const games: Game[] = [
    {
      id: "sudoku",
      name: dictionary.sudoku.name,
      description: dictionary.sudoku.description,
      component: SudokuGame,
    },
    // Add more games here as you develop them, for example:
    // {
    //   id: "chess",
    //   name: dictionary.games.chess.name,
    //   description: dictionary.games.chess.description,
    //   component: ChessGame,
    // },
  ];

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleBackToList = () => {
    setSelectedGame(null);
  };

  useEffect(() => {
    if (selectedGame) {
      window.scrollTo({
        top: 300,
        behavior: "smooth",
      });
    }
  }, [selectedGame]);

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader className='border-b'>
        {/* <CardTitle className='text-2xl font-bold'>
          {dictionary.mini_games}
        </CardTitle> */}
        <CardDescription>{dictionary.header_description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        {selectedGame ? (
          <div>
            <Button
              variant='outline'
              size='sm'
              className='mb-4'
              onClick={handleBackToList}
            >
              <ArrowLeft
                className={clsx(lang === "en" ? "mr-2" : "ml-2", "h-4 w-4")}
              />
              {dictionary.back_button}
            </Button>
            <div className='mt-4'>
              <selectedGame.component />
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {games.map((game) => (
              <Card
                key={game.id}
                className='cursor-pointer hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  <CardTitle>{game.name}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleGameSelect(game)}>
                    <Gift className='mr-2 h-4 w-4' /> {dictionary.play}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TabGames;
