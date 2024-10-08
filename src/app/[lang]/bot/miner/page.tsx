import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary";
import MinerContent from "@/components/bot/miner/MinerContent";
import NavigationTabBar from "@/components/bot/miner/NavigationTabBar";

export default async function MinerPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <MinerContent dictionary={dictionary["miner"]} lang={lang} />
      <NavigationTabBar />
    </>
  );
}
