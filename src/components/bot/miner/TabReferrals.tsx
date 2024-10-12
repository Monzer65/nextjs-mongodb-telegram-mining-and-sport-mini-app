"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLaunchParams, useUtils, initWeb } from "@telegram-apps/sdk-react";
import { Copy, ExternalLink, Users, Coins, Loader2 } from "lucide-react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

export default function TabReferrals({
  dictionary,
  lang,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["earn-tab"]["referrals-tab"];
  lang: Locale;
}) {
  const { toast } = useToast();
  const lp = useLaunchParams();
  const telegramId = lp?.initData?.user?.id;
  const utils = useUtils();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["referrals", telegramId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${telegramId}/referrals`);
      if (!response.ok) {
        throw new Error("Failed to fetch referrals data");
      }
      return response.json();
    },
    enabled: !!telegramId,
  });

  const handleCopyClick = async () => {
    const referralLink = `https://t.me/GoalRushBot/ScoreBoard?ref=${telegramId}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: `${dictionary["toast-success-copy"].title}`,
        description: `${dictionary["toast-success-copy"].description}`,
      });
    } catch (error) {
      // Fallback: Focus and select the input field for manual copy
      const input = document.getElementById(
        "referral-link-input"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
      toast({
        title: `${dictionary["toast-failed-copy"].title}`,
        description: `${dictionary["toast-failed-copy"].description}`,
        variant: "destructive",
      });
    }
  };

  const handleShareClick = () => {
    const referralLink = `https://t.me/GoalRushBot/ScoreBoard?ref=${telegramId}`;

    // Use the Telegram WebApp API to share a message with the referral link
    utils.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=Join%20me%20on%20GoalRushBot%20and%20earn%20rewards!`
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardHeader>
          <CardDescription>{dictionary.error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>
            {dictionary.error["try-again-button"]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const referrals = data?.referrals || [];

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader className='border-b'>
        {/* <CardTitle className='text-2xl font-bold'>{dictionary["header-title"]}</CardTitle> */}
        <CardDescription>{dictionary["header-description"]}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{dictionary["link-title"]}</h3>
          <div className='flex items-center space-x-2' dir='ltr'>
            <Input
              value={`https://t.me/GoalRushBot/ScoreBoard?ref=${telegramId}`}
              readOnly
              id='referral-link-input'
              className='flex-grow'
            />
            <Button variant='outline' size='icon' onClick={handleCopyClick}>
              <Copy className='h-4 w-4' />
              <span className='sr-only'>{dictionary["copy-button"]}</span>
            </Button>
            <Button variant='outline' size='icon' onClick={handleShareClick}>
              <ExternalLink className='h-4 w-4' />
              <span className='sr-only'>{dictionary["share-button"]}</span>
            </Button>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <Users className='h-8 w-8 text-primary' />
                <div
                  className={`${lang === "en" ? "text-right" : "text-left"}`}
                >
                  <p className='text-2xl font-bold'>{referrals.length}</p>
                  <p className='text-sm text-muted-foreground'>
                    {dictionary["total-referrals"]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <Coins className='h-8 w-8 text-primary' />
                <div
                  className={`${lang === "en" ? "text-right" : "text-left"}`}
                >
                  <p className='text-2xl font-bold'>{data.totalTokensEarned}</p>
                  <p className='text-sm text-muted-foreground'>
                    {dictionary["tokens-earned"]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{dictionary["table-title"]}</h3>
          <Card>
            <Table>
              <TableHeader
                className={`${lang === "en" ? "text-left" : "text-right"}`}
              >
                <TableRow>
                  <TableHead>
                    {dictionary["table-header-col-username"]}
                  </TableHead>
                  <TableHead>
                    {dictionary["table-header-col-join-date"]}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((user: any) => (
                  <TableRow key={user.telegramId}>
                    <TableCell className='font-medium'>
                      {user.username}
                    </TableCell>
                    <TableCell>
                      {new Date(user.joinDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </CardContent>
      <CardFooter className='bg-muted/50 border-t'>
        <p className='text-sm text-muted-foreground mt-2'>
          {dictionary["footer-text"]}
        </p>
      </CardFooter>
    </Card>
  );
}
