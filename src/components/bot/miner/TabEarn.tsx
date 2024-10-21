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
      className='w-full'
      dir={lang === "en" ? "ltr" : "rtl"}
    >
      <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg'>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`flex flex-col items-center justify-center text-xs sm:text-sm md:flex-row md:gap-2 p-2 rounded-md transition-all duration-200 ${
              activeTab === tab.value
                ? `${tab.color} bg-white shadow-md`
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <tab.icon
              className={`h-5 w-5 ${activeTab === tab.value ? tab.color : ""}`}
            />
            <span className='text-center font-medium'>{tab.title}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
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
