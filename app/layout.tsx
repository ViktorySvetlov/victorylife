import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Preloader } from "@/components/Preloader";

export const metadata: Metadata = {
  title: "VictoryLife — Начинай побеждать!",
  description: "Личная система эффективности: баллы, цели, достижения, аналитика и твой коуч.",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
