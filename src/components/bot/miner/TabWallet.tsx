"use client";

import { DisplayData } from "@/components/DisplayData/DisplayData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";

export default function TabWallet({
  dictionary,
  lang,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["wallet-tab"];
  lang: Locale;
}) {
  const wallet = useTonWallet();

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        {/* <CardTitle>{dictionary.wallet}</CardTitle> */}
        <CardDescription>
          {!wallet
            ? `${dictionary.header_description_no_wallet}`
            : `${dictionary.header_description_available_wallet}`}
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        {!wallet ? (
          <TonConnectButton className='ton-connect-page__button' />
        ) : (
          <DisplayData
            header={dictionary.account}
            rows={[
              { title: `${dictionary.address}`, value: wallet.account.address },
              { title: `${dictionary.chain}`, value: wallet.account.chain },
              {
                title: `${dictionary.public_key}`,
                value: wallet.account.publicKey,
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
