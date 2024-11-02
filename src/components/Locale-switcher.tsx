"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n-config";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LocaleSwitcher() {
  const pathName = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  const redirectedPathName = useCallback(
    (locale: Locale) => {
      if (!pathName) return "/";
      const segments = pathName.split("/");
      segments[1] = locale;
      return segments.join("/");
    },
    [pathName]
  );

  const localeLabels: {
    [key in Locale]: { name: string; nativeName: string };
  } = {
    en: { name: "English", nativeName: "English" },
    fa: { name: "Farsi", nativeName: "فارسی" },
    ckb: { name: "Kurdish", nativeName: "کوردی" },
  };

  const handleLocaleChange = async (locale: Locale) => {
    try {
      setCookie("userLocale", locale, 365);
      setCurrentLocale(locale);
      router.replace(redirectedPathName(locale));
    } catch (err) {
      console.error("Failed to update locale:", err);
    }
  };

  const currentLocaleLabel = localeLabels[currentLocale];

  useEffect(() => {
    setIsOpen(false);

    // Check if the user's locale is stored in a cookie
    const cookieLocale = getCookie("userLocale");
    if (cookieLocale && i18n.locales.includes(cookieLocale as Locale)) {
      setCurrentLocale(cookieLocale as Locale);
    } else {
      // If not, use the URL locale
      setCurrentLocale(i18n.defaultLocale);
    }
  }, [pathName]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex items-center gap-2 px-3 py-2'>
          <Globe className='h-4 w-4' />
          <span className='hidden sm:inline-block'>
            {currentLocaleLabel.name}
          </span>
          <span className='inline-block sm:hidden'>
            {currentLocale.toUpperCase()}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[200px]'>
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className='flex items-center justify-between'
          >
            <div>
              <p className='font-medium'>{localeLabels[locale].name}</p>
              <p className='text-sm text-muted-foreground'>
                {localeLabels[locale].nativeName}
              </p>
            </div>
            {locale === currentLocale && <Check className='h-4 w-4' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}
