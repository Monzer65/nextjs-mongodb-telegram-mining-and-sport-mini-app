"use client";

import { useState } from "react";
import TabMine from "./TabMine";
import TabEarn from "./TabEarn";
import TabLeaderboard from "./TabLeaderboard";
import TabWallet from "./TabWallet";
import Header from "./Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { Pickaxe, DollarSign, Trophy, Wallet } from "lucide-react";
import clsx from "clsx";

export const levelThresholds = [
  0, 1000, 5000, 10000, 20000, 21850, 21900, 21930, 22000, 22150,
];

type TabValue = "mine" | "earn" | "leaderboard" | "wallet";

type TabData = {
  value: TabValue;
  icon: React.ElementType;
  title: string;
  color: string;
  component: React.ComponentType<{ dictionary: any; lang: Locale }>;
};

type DictionaryType = Awaited<ReturnType<typeof getDictionary>>["miner"];

export default function MinerContent({
  dictionary,
  lang,
}: {
  dictionary: DictionaryType;
  lang: Locale;
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("mine");

  const tabs: TabData[] = [
    {
      value: "mine",
      icon: Pickaxe,
      title: dictionary.tabs.titles.mine,
      color: "text-amber-500",
      component: TabMine,
    },
    {
      value: "earn",
      icon: DollarSign,
      title: dictionary.tabs.titles.earn,
      color: "text-green-500",
      component: TabEarn,
    },
    {
      value: "leaderboard",
      icon: Trophy,
      title: dictionary.tabs.titles.leaderboard,
      color: "text-blue-500",
      component: TabLeaderboard,
    },
    {
      value: "wallet",
      icon: Wallet,
      title: dictionary.tabs.titles.wallet,
      color: "text-purple-500",
      component: TabWallet,
    },
  ];

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Header dictionary={dictionary.header} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className='flex-1 p-2 sm:p-4'
        dir={lang === "en" ? "ltr" : "rtl"}
      >
        <TabsList className='flex justify-between sticky top-[72px] bg-white shadow-md rounded-lg z-10 p-1 overflow-x-auto'>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={clsx(
                "flex items-center justify-center text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2 px-1 xs:px-2 sm:px-3 rounded-md transition-all duration-200 whitespace-nowrap",
                activeTab === tab.value
                  ? `${tab.color} bg-gray-100 shadow-sm`
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <tab.icon
                className={clsx(
                  "h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5",
                  lang === "en" ? "mr-1 xs:mr-2" : "ml-1 xs:ml-2",
                  activeTab === tab.value ? tab.color : ""
                )}
              />
              <span className='font-medium'>{tab.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className='flex-1 mt-4 sm:mt-6'
          >
            <tab.component
              dictionary={
                dictionary.tabs[
                  `${tab.value}-tab` as keyof typeof dictionary.tabs
                ]
              }
              lang={lang}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
