import React from "react";
import { ArrowLeft } from "lucide-react";
import SettingContent from "@/components/bot/miner/setting/SettingContent";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import Link from "next/link";
import NavigationTabBar from "@/components/bot/miner/NavigationTabBar";

const Setting = async ({ params: { lang } }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(lang);
  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex justify-between items-center p-4 '>
        <Link href={`/${lang}/bot/clicker`}>
          <span className='sr-only'>Back to clicker page</span>
          <ArrowLeft className={lang !== "en" ? "rotate-180" : "rotate-0"} />
        </Link>
        <h1 className='text-3xl font-bold mb-6'>Settings</h1>
      </div>

      <SettingContent dictionary={dictionary["bot-home-page"]} />

      <NavigationTabBar />
    </div>
  );
};

export default Setting;
