"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TabMine from "./TabMine";
import TabTasks from "./TabTasks";
import TabEarn from "./TabEarn";
import TabLeaderboard from "./TabLeaderboard";
import TabWallet from "./TabWallet";
import Header from "./Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDictionary } from "@/get-dictionary";
import { useInitData } from "@telegram-apps/sdk-react";
import { useAnimate } from "framer-motion";
import { Locale } from "@/i18n-config";

export const levelThresholds = [
  0, 1000, 5000, 10000, 20000, 21850, 21900, 21930, 22000, 22150,
];

export default function MinerContent({
  dictionary,
  lang,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["miner"];
  lang: Locale;
}) {
  const [activeTab, setActiveTab] = useState("mine");

  return (
    <div className='min-h-screen flex flex-col'>
      <Header dictionary={dictionary.header} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='flex-1 p-4 mb-16'
        dir={lang === "en" ? "ltr" : "rtl"}
      >
        <TabsList className='flex justify-between sticky top-0 bg-slate-200 z-10'>
          <TabsTrigger value='mine'>{dictionary.tabs.titles.mine}</TabsTrigger>
          <TabsTrigger value='earn'>{dictionary.tabs.titles.earn}</TabsTrigger>
          <TabsTrigger value='leaderboard'>
            {dictionary.tabs.titles.leaderboard}
          </TabsTrigger>
          <TabsTrigger value='wallet'>
            {dictionary.tabs.titles.wallet}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='mine' className='flex-1 mt-4'>
          <TabMine dictionary={dictionary.tabs["mine-tab"]} />
        </TabsContent>
        <TabsContent value='earn' className='flex-1 mt-4'>
          <TabEarn dictionary={dictionary.tabs["earn-tab"]} lang={lang} />
        </TabsContent>
        <TabsContent value='leaderboard' className='flex-1 mt-4'>
          <TabLeaderboard
            dictionary={dictionary.tabs["leaderboard-tab"]}
            lang={lang}
          />
        </TabsContent>
        <TabsContent value='wallet' className='flex-1 mt-4'>
          <TabWallet dictionary={dictionary.tabs["wallet-tab"]} lang={lang} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
