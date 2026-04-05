"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "ホーム",
    match: (pathname) => pathname === "/",
  },
  {
    href: "/selections/search",
    label: "うたろう厳選",
    match: (pathname) => pathname.startsWith("/selections"),
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-emerald-50 text-emerald-700"
                : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
