"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Zap } from "lucide-react";
import TabTasks from "./TabTasks";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import TabReferrals from "./TabReferrals";
import TabBoosts from "./TabBoosts";
import TabGames from "./TabGames";

export default function TabEarn({
  dictionary,
  lang,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["earn-tab"];
  lang: Locale;
}) {
  return (
    <Tabs
      defaultValue='tasks'
      className='w-full'
      dir={lang === "en" ? "ltr" : "rtl"}
    >
      <TabsList className='grid w-full grid-cols-4'>
        <TabsTrigger value='tasks'>{dictionary.titles.tasks}</TabsTrigger>
        <TabsTrigger value='referrals'>
          {dictionary.titles.referrals}
        </TabsTrigger>
        <TabsTrigger value='boosts'>{dictionary.titles.boost}</TabsTrigger>
        <TabsTrigger value='mini-games'>
          {dictionary.titles["mini-games"]}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='tasks'>
        <TabTasks dictionary={dictionary["tasks-tab"]} lang={lang} />
      </TabsContent>
      <TabsContent value='referrals'>
        <TabReferrals dictionary={dictionary["referrals-tab"]} lang={lang} />
      </TabsContent>
      <TabsContent value='boosts'>
        <TabBoosts dictionary={dictionary["boosts-tab"]} lang={lang} />
      </TabsContent>
      <TabsContent value='mini-games'>
        <TabGames dictionary={dictionary["mini-games-tab"]} lang={lang} />
      </TabsContent>
    </Tabs>
  );
}
