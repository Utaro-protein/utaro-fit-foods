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
        <header className="bg-emerald-500 px-6 py-3 shadow-sm [&_a]:text-white [&_a]:hover:text-zinc-100 [&_button]:text-white [&_button]:hover:text-zinc-100 dark:bg-emerald-600 [&_span]:text-white">
          <div className="flex w-full items-center justify-between">
            <a href="/" className="font-semibold text-white dark:text-zinc-100">
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
