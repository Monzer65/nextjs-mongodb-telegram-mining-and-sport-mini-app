import Image from "next/image";
import Link from "next/link";
import {
  lobsterForLogos,
  playfairDisplayForHeadings,
  quicksandForElements,
} from "@/app/_assets/fonts";
import scoreboardImage from "@/app/_assets/scoreboard.png";
import telegramImage from "@/app/_assets/telegram.svg";
import xImage from "@/app/_assets/twitter.svg";

const LandingPage = async () => {
  return (
    <div className='flex flex-col min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-gray-800 text-white py-4 shadow-md'>
        <div className='container mx-auto flex justify-between items-center px-4'>
          <h1 className={`text-3xl font-bold ${lobsterForLogos.className}`}>
            Scoreboard
          </h1>
          <div className='flex space-x-4'>
            <button
              className=''
              title='not working for now! try telegram channel instead'
            >
              <Image
                src={xImage}
                alt='X Logo'
                width={54}
                height={54}
                className='hover:opacity-75 transition-opacity'
              />
            </button>
            <Link href='https://t.me/ScorBoardChannel' passHref>
              <Image
                src={telegramImage}
                alt='Telegram Logo'
                width={54}
                height={54}
                className='hover:opacity-75 transition-opacity'
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className='flex-grow container mx-auto px-4 py-16 text-center'>
        <h2
          className={`text-4xl font-bold text-gray-800 mb-8 ${playfairDisplayForHeadings.className}`}
        >
          Classic Kicks, Crypto Clicks!
        </h2>
        <p className='text-lg text-gray-700 leading-relaxed tracking-wide mb-12 bg-gray-100 p-4 rounded-lg shadow-sm max-w-screen-md mx-auto'>
          Relive your favorite sports moments while earning real rewards! Tap to
          score big in our addictive mini-games and watch your earnings
          multiply. Join the fun and start your crypto journey today!
        </p>

        <Link
          href={"https://t.me/GoalRushBot"}
          className={`bg-blue-500 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-600 transition font-semibold ${quicksandForElements.className}`}
        >
          Start Earning Now!
        </Link>

        <div className='my-12'>
          <Image
            src={scoreboardImage}
            alt='Game Image'
            width={800}
            height={450}
            className='rounded-md shadow-lg mx-auto'
          />
        </div>
        <Link
          href={"https://t.me/GoalRushBot"}
          className={`bg-blue-500 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-600 transition font-semibold ${quicksandForElements.className}`}
        >
          Start Earning Now!
        </Link>
      </div>

      {/* Footer */}
      <footer className='bg-gray-800 text-gray-300 py-6'>
        <div className='container mx-auto text-center'>
          <p className='mb-4'>
            Use our Telegram mini-app now and start earning coins!
          </p>
          <p>&copy; 2024 Goal Rush Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
