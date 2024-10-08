"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type getDictionary } from "../../../../get-dictionary";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import LocaleSwitcher from "@/components/Locale-switcher";
const SettingContent = ({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["bot-home-page"];
}) => {
  return (
    <Tabs defaultValue='account' className='p-4 mb-16'>
      <TabsList>
        <TabsTrigger value='account'>Account</TabsTrigger>
        <TabsTrigger value='notifications'>Notifications</TabsTrigger>
        <TabsTrigger value='language'>Language</TabsTrigger>
        <TabsTrigger value='privacy'>Privacy</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account details and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input id='name' placeholder='Enter your name' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='Enter your email' />
            </div>
            <div className='flex items-center space-x-2'>
              <Switch id='marketing' />
              <Label htmlFor='marketing'>Receive marketing emails</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value='notifications'>
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Switch id='push-notifications' />
              <Label htmlFor='push-notifications'>
                Enable push notifications
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch id='email-notifications' />
              <Label htmlFor='email-notifications'>
                Enable email notifications
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value='language'>
        <Card>
          <CardHeader>
            <CardTitle>Language Settings</CardTitle>
            <CardDescription>Choose your preferred language.</CardDescription>
          </CardHeader>
          <CardContent>
            <LocaleSwitcher />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value='privacy'>
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Manage your privacy preferences.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Switch id='data-collection' />
              <Label htmlFor='data-collection'>
                Allow data collection for personalization
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch id='third-party-sharing' />
              <Label htmlFor='third-party-sharing'>
                Allow sharing data with third parties
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingContent;
