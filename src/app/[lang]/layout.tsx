import type { Metadata } from "next";
import "@/app/_assets/globals.css";
import { vazirmatn } from "@/app/_assets/fonts";
import { i18n, type Locale } from "../../i18n-config";
import { Toaster } from "@/components/ui/toaster";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: "ScoreBoard App By GoalRush",
  description: "The leading Telegram web-app for Sports",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const textDirection =
    params.lang === "ckb" || params.lang === "fa" ? "rtl" : "ltr";

  return (
    <html lang={params.lang} dir={textDirection}>
      <body className={vazirmatn.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
