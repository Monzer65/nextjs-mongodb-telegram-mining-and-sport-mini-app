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
import { Locale } from "@/i18n-config";
import { ScrollArea } from "@/components/ui/scroll-area";
const SettingContent = ({
  dictionary,
  lang,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["miner"]["setting"];
  lang: Locale;
}) => {
  return (
    <Tabs
      defaultValue='language'
      className='p-4 mb-16'
      dir={lang === "en" ? "ltr" : "rtl"}
    >
      <TabsList>
        <TabsTrigger value='language'>{dictionary.language}</TabsTrigger>
        <TabsTrigger value='TermsAndprivacy'>{dictionary.terms}</TabsTrigger>
        <TabsTrigger value='help'>{dictionary.help}</TabsTrigger>
      </TabsList>
      <TabsContent value='language'>
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.language_setting}</CardTitle>
            <CardDescription>{dictionary.language_description}</CardDescription>
          </CardHeader>
          <CardContent>
            <LocaleSwitcher />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='help'>
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

      <TabsContent value='TermsAndprivacy'>
        <Card>
          <CardHeader>
            <CardTitle>
              {/* {dictionary.termsAndPrivacy} */}
              Terms And Privacy
            </CardTitle>
            <CardDescription>
              {/* {dictionary.termsAndPrivacyDesc} */}
              Description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='terms'>
              <TabsList className='grid w-full grid-cols-2 mb-4'>
                <TabsTrigger value='terms'>
                  {/* {dictionary.termsOfService} */}
                  Terms of Service
                </TabsTrigger>
                <TabsTrigger value='privacy'>
                  {/* {dictionary.privacyPolicy} */}
                  Privacy Policy
                </TabsTrigger>
              </TabsList>
              <TabsContent value='terms'>
                <ScrollArea className='h-[400px] w-full rounded-md border p-4'>
                  <h2 className='text-lg font-bold mb-2'>
                    Terms of Service (ToS) for Scoreboard
                  </h2>
                  <ol className='list-decimal pl-5 space-y-4'>
                    <li>
                      <h3 className='font-semibold'>Introduction</h3>
                      <p>
                        Welcome to Scoreboard, a sports app providing live
                        scores, news, and a mining feature. By using the
                        Scoreboard app on Telegram, you agree to these Terms of
                        Service. Please review these terms carefully as they
                        govern your use of the app.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Eligibility</h3>
                      <p>
                        To use Scoreboard, you must be at least 13 years old or
                        meet your country`&apos;s age requirement. By using this
                        app, you confirm that you meet this requirement.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>User Responsibilities</h3>
                      <ul className='list-disc pl-5'>
                        <li>
                          Account Information: You are responsible for keeping
                          your Telegram account secure. Do not share your
                          account details with anyone else.
                        </li>
                        <li>
                          Mining Feature: The mining feature operates for a
                          maximum of 4 hours per activation. Users must manually
                          re-activate mining to continue earning. You agree to
                          use this feature as intended.
                        </li>
                        <li>
                          Acceptable Use: You agree not to misuse the app for
                          illegal purposes, abuse other users, or disrupt the
                          app`&apos;s services.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Service Availability</h3>
                      <p>
                        Scoreboard may change or discontinue parts of the
                        service at any time without notice. We do not guarantee
                        uninterrupted service.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>
                        Content & Intellectual Property
                      </h3>
                      <p>
                        The app`&apos;s content, including the user interface,
                        APIs, and design, is the property of Scoreboard or its
                        licensors. You may not copy, distribute, or
                        reverse-engineer any part of the app without permission.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Third-Party Services</h3>
                      <p>
                        Scoreboard integrates with free sports APIs to provide
                        live scores and news. We are not responsible for any
                        third-party services or links accessed through the app.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Termination</h3>
                      <p>
                        We reserve the right to terminate or suspend your access
                        to Scoreboard at any time, especially for misuse of the
                        app or violation of these terms. Upon termination, all
                        mining progress, account data, and referrals will be
                        lost.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>
                        Disclaimers and Limitation of Liability
                      </h3>
                      <p>
                        Scoreboard is provided {"as is"} without warranties of
                        any kind. We are not liable for any damages that may
                        occur from using the app, including but not limited to
                        data loss or service interruptions.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Governing Law</h3>
                      <p>
                        These terms are governed by the laws of [Your Country].
                        Any disputes related to Scoreboard will be resolved in
                        [Your Jurisdiction].
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Changes to Terms</h3>
                      <p>
                        We may update these terms at any time. Any significant
                        changes will be communicated via the Telegram app or
                        email. Your continued use of the app after updates
                        implies agreement to the revised terms.
                      </p>
                    </li>
                  </ol>
                </ScrollArea>
              </TabsContent>
              <TabsContent value='privacy'>
                <ScrollArea className='h-[400px] w-full rounded-md border p-4'>
                  <h2 className='text-lg font-bold mb-2'>
                    Privacy Policy for Scoreboard
                  </h2>
                  <ol className='list-decimal pl-5 space-y-4'>
                    <li>
                      <h3 className='font-semibold'>Introduction</h3>
                      <p>
                        Your privacy is important to us at Scoreboard. This
                        Privacy Policy outlines how we collect, use, and protect
                        your data when using our app through Telegram.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Information We Collect</h3>
                      <ul className='list-disc pl-5'>
                        <li>
                          Personal Information: We collect the following
                          personal data related to the mining feature: name,
                          username, Telegram ID, referral information, and score
                          details.
                        </li>
                        <li>
                          Mining Data: The app also records your mining
                          activity, including mining speed, boosters used, and
                          streak updates.
                        </li>
                        <li>
                          Telegram Data: We collect your Telegram username and
                          ID to provide personalized services.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <h3 className='font-semibold'>
                        How We Use the Information
                      </h3>
                      <p>We use the collected data to:</p>
                      <ul className='list-disc pl-5'>
                        <li>
                          Track mining activity and reward scores based on your
                          participation.
                        </li>
                        <li>
                          Personalize your experience by showing live scores and
                          news based on your preferences.
                        </li>
                        <li>
                          Monitor app performance and identify areas for
                          improvement.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Data Sharing</h3>
                      <p>
                        We do not sell your personal data. We may share data
                        with third parties only in the following cases:
                      </p>
                      <ul className='list-disc pl-5'>
                        <li>
                          With third-party services providing sports data (e.g.,
                          APIs), though this does not include your personal
                          information.
                        </li>
                        <li>If required by law or court orders.</li>
                      </ul>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Data Storage & Security</h3>
                      <p>
                        We store your data securely and take appropriate
                        measures to protect it. However, no system is entirely
                        secure, and we cannot guarantee absolute security of
                        your data. Data related to mining activities will be
                        retained until you delete your account or request
                        removal.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>User Rights</h3>
                      <p>You have the right to:</p>
                      <ul className='list-disc pl-5'>
                        <li>Access the data we collect about you.</li>
                        <li>
                          Request correction or deletion of your personal
                          information.
                        </li>
                        <li>
                          Revoke consent for data processing by contacting our
                          support team at [Support Email].
                        </li>
                      </ul>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Cookies and Tracking</h3>
                      <p>
                        We do not use cookies for tracking as the app operates
                        within Telegram`&apos;s platform. However, third-party
                        services providing live scores and news may use cookies
                        to improve their services.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>
                        Children`&apos;s Privacy
                      </h3>
                      <p>
                        Scoreboard is not intended for children under 13. We do
                        not knowingly collect data from users below this age. If
                        you are a parent and believe your child is using the app
                        without consent, please contact us.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Third-Party Links</h3>
                      <p>
                        We are not responsible for the privacy practices of
                        third-party services or websites linked within the app.
                        Users should review the privacy policies of these
                        services separately.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>
                        Changes to Privacy Policy
                      </h3>
                      <p>
                        We may update this Privacy Policy as the app evolves.
                        Any changes will be communicated via the Telegram
                        platform or email. Continued use of the app indicates
                        your acceptance of the updated policy.
                      </p>
                    </li>
                    <li>
                      <h3 className='font-semibold'>Contact Information</h3>
                      <p>
                        For any questions or concerns regarding your privacy,
                        please contact us at [Support Email].
                      </p>
                    </li>
                  </ol>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingContent;
