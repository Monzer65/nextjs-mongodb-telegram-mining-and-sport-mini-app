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
    <div>
      <SettingContent dictionary={dictionary["miner"]["setting"]} lang={lang} />

      <NavigationTabBar dictionary={dictionary.miner.navbar} lang={lang} />
    </div>
  );
};

export default Setting;
