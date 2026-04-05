import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AppSidebar } from "./components/AppSidebar";
import { MobileSidebarMenu } from "./components/MobileSidebarMenu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "うたろうフィットフード",
  description: "ボディメイク中でも安心して食べられる、うたろう厳選の100品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50 antialiased`}
      >
        <div className="min-h-screen md:grid md:grid-cols-[250px_minmax(0,1fr)]">
          <AppSidebar />

          <div className="min-w-0">
            <header className="border-b border-zinc-200 bg-white px-4 py-3 shadow-sm md:hidden">
              <div className="flex items-center justify-between gap-2">
                <MobileSidebarMenu />
                <Link href="/" className="font-semibold text-emerald-700">
                  うたろうフィットフード
                </Link>
                <span className="w-9" aria-hidden />
              </div>
            </header>
            <div>{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
