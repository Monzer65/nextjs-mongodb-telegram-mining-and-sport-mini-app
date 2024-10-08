"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale } from "@/i18n-config";
import { House, Pickaxe, Settings } from "lucide-react";

const links = [
  { href: "/bot", name: "Home", Icon: House },
  { href: "/bot/miner", name: "Miner", Icon: Pickaxe },
  { href: "/bot/miner/setting", name: "Setting", Icon: Settings },
];

export default function NavigationTabBar() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] as Locale;

  // Memoize the fullHref calculation to avoid recomputation on each render
  const activeLinks = useMemo(
    () =>
      links.map(({ href, name, Icon }) => {
        const fullHref = `/${locale}${href}`;
        const isActive = fullHref === pathname;
        return { fullHref, name, Icon, isActive };
      }),
    [pathname, locale]
  );

  return (
    <nav className='fixed bottom-0 inset-x-0 bg-gray-800 text-white shadow-lg border-t border-slate-600'>
      <ul className='flex justify-around items-center'>
        {activeLinks.map(({ fullHref, name, Icon, isActive }) => (
          <li key={fullHref} className='relative flex-1'>
            <Link
              href={fullHref}
              passHref
              className={`flex flex-col items-center justify-center p-2 ${
                isActive ? "text-inherit" : "text-gray-500"
              }`}
            >
              <Icon />
              <span className='text-sm'>{name}</span>
              {isActive && (
                <div className='absolute -bottom-0 left-1 right-1 h-1 bg-indigo-600 rounded-t-full' />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
