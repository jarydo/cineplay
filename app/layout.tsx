import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trivia Game",
  description: "Real-time multiplayer trivia game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* This div ensures min-height works correctly */}
        <div className="min-h-screen bg-gray-100">{children}</div>
      </body>
    </html>
  );
}
