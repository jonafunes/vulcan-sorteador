import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// @ts-ignore - ViewTransition existe en React 19 RC pero los tipos aún no están actualizados
import { ViewTransition } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sorteador Vulcan",
  description: "Crea los torneos con tus amigos de la manera mas fácil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ViewTransition name="page">
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
