import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Holicruit - Recruitment Platform",
  description:
    "Connect freelance headhunters with hiring companies. Smart matching and pipeline management.",
  appleWebApp: {
    capable: true,
    title: "Holicruit",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
