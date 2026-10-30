import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import "./globals.css";

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Avalia",
  description: "Avalie produtos e leia experiências reais da comunidade.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
