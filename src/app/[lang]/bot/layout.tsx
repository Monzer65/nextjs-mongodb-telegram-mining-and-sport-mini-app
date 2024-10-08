import type { PropsWithChildren } from "react";
import type { Metadata } from "next";

import { Root } from "@/components/Root/Root";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "normalize.css/normalize.css";

export const metadata: Metadata = {
  title: "ScoreBoard Miner",
  description: "Your application description goes here",
};

export default function BotLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <Root>{children}</Root>
    </div>
  );
}
