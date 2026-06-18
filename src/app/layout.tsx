import type { Metadata, Viewport } from "next";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const viewport: Viewport = {
  themeColor: "#E0533D",
};

export const metadata: Metadata = {
  title: "Holicruit - Transparent, Holistic Recruiting",
  description:
    "Radical transparency in hiring. Candidates see exactly which skills they lack. Hiring managers see every candidate scored. Everyone wins when everyone knows where they stand.",
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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
