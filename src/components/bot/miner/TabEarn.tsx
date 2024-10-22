"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Users, Bolt, Gamepad2 } from "lucide-react";
import TabTasks from "./TabTasks";
import TabReferrals from "./TabReferrals";
import TabBoosts from "./TabBoosts";
import TabGames from "./TabGames";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import clsx from "clsx";

type TabValue = "tasks" | "referrals" | "boosts" | "mini-games";

type TabData = {
  value: TabValue;
  icon: React.ElementType;
  title: string;
  component: React.ComponentType<{ dictionary: any; lang: Locale }>;
  color: string;
};

type DictionaryType = Awaited<
  ReturnType<typeof getDictionary>
>["miner"]["tabs"]["earn-tab"];

export default function TabEarn({
  dictionary,
  lang,
}: {
  dictionary: DictionaryType;
  lang: Locale;
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("tasks");

  const tabs: TabData[] = [
    {
      value: "tasks",
      icon: ClipboardCheck,
      title: dictionary.titles.tasks,
      component: TabTasks,
      color: "text-blue-500",
    },
    {
      value: "referrals",
      icon: Users,
      title: dictionary.titles.referrals,
      component: TabReferrals,
      color: "text-green-500",
    },
    {
      value: "boosts",
      icon: Bolt,
      title: dictionary.titles.boost,
      component: TabBoosts,
      color: "text-yellow-500",
    },
    {
      value: "mini-games",
      icon: Gamepad2,
      title: dictionary.titles["mini-games"],
      component: TabGames,
      color: "text-purple-500",
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabValue)}
      className='flex-1 p-2 sm:p-4 mb-16'
      dir={lang === "en" ? "ltr" : "rtl"}
    >
      <TabsList className='flex justify-between sticky top-[110px] bg-white shadow-md rounded-lg z-10 p-1 overflow-x-auto'>
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
              dictionary[`${tab.value}-tab` as keyof DictionaryType] as any
            }
            lang={lang}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
