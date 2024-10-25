"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import LocaleSwitcher from "@/components/Locale-switcher";
import { Locale } from "@/i18n-config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDictionary } from "@/get-dictionary";

type TabValue = "language" | "termsAndprivacy" | "help";

export default function SettingContent({
  dictionary,
  lang,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["miner"]["setting"];
  lang: Locale;
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("language");

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <header className='bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-10'>
        <div className='flex justify-between items-center p-4'>
          <h2 className='text-xl font-semibold leading-none tracking-tight text-purple-800'>
            {dictionary.settings}
          </h2>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className='flex-1 p-2 sm:p-4 mb-16'
        dir={lang === "en" ? "ltr" : "rtl"}
      >
        <TabsList className='flex justify-between sticky top-[80px] bg-white shadow-md rounded-lg z-10 p-1 overflow-x-auto'>
          <TabsTrigger value='language'>{dictionary.language}</TabsTrigger>
          <TabsTrigger value='termsAndprivacy'>
            {dictionary.termsAndPrivacy}
          </TabsTrigger>
          <TabsTrigger value='help'>{dictionary.help}</TabsTrigger>
        </TabsList>

        <TabsContent value='language'>
          <Card>
            <CardHeader>
              <CardDescription>
                {dictionary.language_description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocaleSwitcher />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='termsAndprivacy'>
          <Card>
            <CardHeader>
              <CardDescription>
                {dictionary.termsAndPrivacyDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue='terms'
                className='flex-1 p-2 sm:p-4 mb-16'
                dir={lang === "en" ? "ltr" : "rtl"}
              >
                <TabsList className='flex justify-between sticky top-[118px] bg-white shadow-md rounded-lg z-10 p-1 overflow-x-auto'>
                  <TabsTrigger value='terms'>{dictionary.terms}</TabsTrigger>
                  <TabsTrigger value='privacy'>
                    {dictionary.privacy}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='terms'>
                  <ScrollArea
                    className='h-[400px] w-full rounded-md border p-4'
                    dir={lang === "en" ? "ltr" : "rtl"}
                  >
                    <ol className='list-decimal px-5 space-y-4'>
                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].intro}
                        </h3>
                        <p>{dictionary["terms-content"].intro_content}</p>
                      </li>
                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].elegibility}
                        </h3>
                        <p>{dictionary["terms-content"].elegibility_content}</p>
                      </li>
                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].use_responsibilities}
                        </h3>
                        <ul className='list-disc pl-5'>
                          <li>
                            {
                              dictionary["terms-content"]
                                .use_responsibilities_content_1
                            }
                          </li>
                          <li>
                            {
                              dictionary["terms-content"]
                                .use_responsibilities_content_2
                            }
                          </li>
                          <li>
                            {
                              dictionary["terms-content"]
                                .use_responsibilities_content_3
                            }
                          </li>
                        </ul>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].availability}
                        </h3>
                        <p>
                          {dictionary["terms-content"].availability_content}
                        </p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].property}
                        </h3>
                        <p>{dictionary["terms-content"].property_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].third_party}
                        </h3>
                        <p>{dictionary["terms-content"].third_party_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].termination}
                        </h3>
                        <p>{dictionary["terms-content"].termination_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].liability}
                        </h3>
                        <p>{dictionary["terms-content"].liability_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].governing}
                        </h3>
                        <p>{dictionary["terms-content"].governing_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary["terms-content"].change_to_terms}
                        </h3>
                        <p>
                          {dictionary["terms-content"].change_to_terms_content}
                        </p>
                      </li>
                    </ol>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value='privacy'>
                  <ScrollArea
                    className='h-[400px] w-full rounded-md border p-4'
                    dir={lang === "en" ? "ltr" : "rtl"}
                  >
                    <ol className='list-decimal pl-5 space-y-4'>
                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.intro}
                        </h3>
                        <p>{dictionary.privacy_content.intro_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.info_collection}
                        </h3>
                        <ul className='list-disc pl-5'>
                          <li>
                            {
                              dictionary.privacy_content
                                .info_collection_content_1
                            }
                          </li>
                          <li>
                            {
                              dictionary.privacy_content
                                .info_collection_content_2
                            }
                          </li>
                          <li>
                            {
                              dictionary.privacy_content
                                .info_collection_content_3
                            }
                          </li>
                        </ul>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.info_usage}
                        </h3>
                        <p>{dictionary.privacy_content.info_usage_content_1}</p>
                        <ul className='list-disc pl-5'>
                          <li>
                            {dictionary.privacy_content.info_usage_content_2}
                          </li>
                          <li>
                            {dictionary.privacy_content.info_usage_content_3}
                          </li>
                          <li>
                            {dictionary.privacy_content.info_usage_content_4}
                          </li>
                        </ul>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.data_sharing}
                        </h3>
                        <p>
                          {dictionary.privacy_content.data_sharing_content_1}
                        </p>
                        <ul className='list-disc pl-5'>
                          <li>
                            {dictionary.privacy_content.data_sharing_content_2}
                          </li>
                          <li>
                            {dictionary.privacy_content.data_sharing_content_3}
                          </li>
                        </ul>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.data_storage}
                        </h3>
                        <p>{dictionary.privacy_content.data_storage_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.user_rights}
                        </h3>
                        <p>
                          {dictionary.privacy_content.user_rights_content_1}
                        </p>
                        <ul className='list-disc pl-5'>
                          <li>
                            {dictionary.privacy_content.user_rights_content_2}
                          </li>
                          <li>
                            {dictionary.privacy_content.user_rights_content_3}
                          </li>
                          <li>
                            {dictionary.privacy_content.user_rights_content_4}
                            danesh.monzer@gmail.com.
                          </li>
                        </ul>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.cookies}
                        </h3>
                        <p>{dictionary.privacy_content.cookies_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.children}
                        </h3>
                        <p>{dictionary.privacy_content.children_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.links}
                        </h3>
                        <p>{dictionary.privacy_content.links_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.changes}
                        </h3>
                        <p>{dictionary.privacy_content.changes_content}</p>
                      </li>

                      <li>
                        <h3 className='font-semibold'>
                          {dictionary.privacy_content.contact_info}
                        </h3>
                        <p>
                          {dictionary.privacy_content.contact_info_content}{" "}
                          danesh.monzer@gmail.com.
                        </p>
                      </li>
                    </ol>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='help'>
          <Card>
            <CardHeader>
              <CardDescription>{dictionary.help_content}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-2'></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
