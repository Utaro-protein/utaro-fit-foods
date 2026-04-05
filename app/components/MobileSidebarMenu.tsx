"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthLinks } from "./AuthLinks";
import { SidebarNav } from "./SidebarNav";

export function MobileSidebarMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 shadow-sm"
        aria-label="メニューを開く"
        aria-expanded={open}
      >
        <span className="sr-only">メニューを開く</span>
        <span className="flex flex-col gap-1">
          <span className="h-0.5 w-4 rounded bg-zinc-700" />
          <span className="h-0.5 w-4 rounded bg-zinc-700" />
          <span className="h-0.5 w-4 rounded bg-zinc-700" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/35"
            aria-label="メニューを閉じる"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col border-r border-zinc-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-base font-bold tracking-tight text-emerald-700">
                うたろうフィットフード
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
                aria-label="メニューを閉じる"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-500">Fit Foods Guide</p>

            <div className="mt-5">
              <SidebarNav />
            </div>

            <div className="mt-4 border-t border-zinc-200 pt-4">
              <AuthLinks />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
