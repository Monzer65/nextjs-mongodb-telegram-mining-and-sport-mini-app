import { useState } from "react";
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

type Game = {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
};

const games: Game[] = [
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Classic number-placement puzzle",
    component: SudokuGame,
  },
  // Add more games here as you develop them
  // {
  //   id: "chess",
  //   name: "Chess",
  //   description: "Strategic board game",
  //   component: ChessGame,
  // },
];

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

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleBackToList = () => {
    setSelectedGame(null);
  };

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Mini Games</CardTitle>
        <CardDescription>
          Claim special rewards and bonuses by playing games
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedGame ? (
          <div>
            <Button
              variant='outline'
              size='sm'
              className='mb-4'
              onClick={handleBackToList}
            >
              <ArrowLeft className='mr-2 h-4 w-4' /> Back to game list
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
                    <Gift className='mr-2 h-4 w-4' /> Play Now
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
