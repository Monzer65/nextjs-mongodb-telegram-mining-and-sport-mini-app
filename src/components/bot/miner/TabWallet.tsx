"use client";

import { DisplayData } from "@/components/DisplayData/DisplayData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";

export default function TabWallet() {
  const wallet = useTonWallet();

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>
          {!wallet ? "Connect your wallet" : "Your wallet info"}
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        {!wallet ? (
          <TonConnectButton className='ton-connect-page__button' />
        ) : (
          <DisplayData
            header='Account'
            rows={[
              { title: "Address", value: wallet.account.address },
              { title: "Chain", value: wallet.account.chain },
              { title: "Public Key", value: wallet.account.publicKey },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
