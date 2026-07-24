import type { Metadata, Viewport } from "next";
// Brand type, self-hosted (bundled at build — no external fetch):
// Figtree (body/UI) + Instrument Serif (display headlines).
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/600.css";
import "@fontsource/figtree/700.css";
import "@fontsource/figtree/800.css";
import "@fontsource/instrument-serif/400.css";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const viewport: Viewport = {
  themeColor: "#C75B39",
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
