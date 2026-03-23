import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ConditionalRoot } from "../components/ConditionalRoot";
import { Providers } from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS",
  description: "Learning Management System"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-neutral-100 text-gray-900 antialiased`}>
        <Providers>
          <ConditionalRoot>{children}</ConditionalRoot>
        </Providers>
      </body>
    </html>
  );
}

