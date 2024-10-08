import Link from "next/link";
import { lobsterForLogos, vazirmatn } from "@/app/_assets/fonts";
import LocaleSwitcher from "@/components/Locale-switcher";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary";
import Username from "@/components/Username";

export default async function BotHome({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-blue-200 text-black text-center ${vazirmatn.className}`}
    >
      <h1
        className={`text-5xl font-bold mt-20 ${lobsterForLogos.className}`}
        dir='ltr'
      >
        ScoreBoard
        <span className='inline-block bg-blue-700 w-3 h-3 rounded-sm ml-2'></span>
      </h1>
      <LocaleSwitcher />
      <p className='text-3xl mt-8 text-gray-600'>
        {dictionary["bot-home-page"].greating} <Username />!
      </p>
      <p className='text-lg mt-2 text-gray-500'>
        {dictionary["bot-home-page"]["launching-soon"]}
      </p>

      <div className='mt-12 w-full max-w-sm'>
        <div className='p-6 bg-white shadow-lg rounded-lg'>
          <h2 className='text-2xl font-bold text-blue-700 mb-4'>
            {dictionary["bot-home-page"]["start-earning"]}
          </h2>
          <p className='text-gray-700 text-lg leading-relaxed mb-6'>
            {dictionary["bot-home-page"]["click-below"]}
          </p>
          <Link
            href={`/${lang}/bot/miner`}
            className='bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full text-xl'
          >
            {dictionary["bot-home-page"]["go-to-miner"]}
          </Link>
        </div>
      </div>

      <p className='text-6xl text-gray-400 mt-16 mb-6'>
        {dictionary["bot-home-page"]["launching-soon-title"]}
      </p>

      <p className='text-gray-700 text-lg leading-relaxed mb-12 max-w-[600px]'>
        {dictionary["bot-home-page"]["get-ready"]}
      </p>

      <form
        action=''
        className='flex flex-col gap-4 text-xl mb-24 w-full max-w-sm'
      >
        <input
          type='text'
          placeholder={dictionary["bot-home-page"]["placeholder-email"]}
          className='px-4 py-2 border border-blue-500 rounded-full'
        />
        <button className='bg-blue-500 text-white font-bold py-2 px-4 rounded-full'>
          {dictionary["bot-home-page"]["notify-me"]}
        </button>
      </form>

      <footer className='w-full max-w-2xl text-center mt-16'>
        <p className='text-sm text-gray-500'>
          {dictionary["bot-home-page"]["footer"]}
        </p>
        <p className='text-xs text-gray-400 mt-2'>
          {dictionary["bot-home-page"]["powered-by"]}
        </p>
        <div className='flex justify-center mt-4'>
          <Link
            href='https://twitter.com/ScoreBoard'
            className='text-blue-500 mx-2'
          >
            Twitter
          </Link>
          <Link
            href='https://t.me/ScoreBoardChannel'
            className='text-blue-500 mx-2'
          >
            Telegram
          </Link>
        </div>
      </footer>
    </div>
  );
}
