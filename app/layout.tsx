import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "@/components/auth/provider";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AniStream - Watch Anime Online",
  description: "Watch anime online with multiple sources, AniList integration, and more!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="py-4 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} AniStream - Not affiliated with AniList or any anime streaming service
            </footer>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
