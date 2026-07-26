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
  title: "Holicruit — No black box. No cold applications. No silent no.",
  description:
    "Just the whole person, measured and matched in the open — with an honest path forward for everyone. Holistic, opt-in, radically transparent hiring.",
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
