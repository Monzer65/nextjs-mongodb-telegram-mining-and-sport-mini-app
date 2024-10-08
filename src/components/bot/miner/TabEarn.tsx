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
        <TabBoosts
        // dictionary={dictionary["boosts-tab"]}
        />
      </TabsContent>
      <TabsContent value='mini-games'>
        <Card>
          <CardHeader>
            <CardTitle>Special Rewards</CardTitle>
            <CardDescription>Claim special rewards and bonuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Gift className='w-4 h-4' />
                  <span>Daily Bonus</span>
                </div>
                <Button size='sm'>Claim 100 tokens</Button>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Gift className='w-4 h-4' />
                  <span>Level Up Reward</span>
                </div>
                <Button size='sm' disabled>
                  Claim at Level 5
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
