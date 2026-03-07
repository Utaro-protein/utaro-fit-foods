import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthLinks } from "./components/AuthLinks";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex w-full items-center justify-between">
            <a href="/" className="font-semibold text-zinc-900 dark:text-zinc-100">
              うたろうフィットフード
            </a>
            <AuthLinks />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
