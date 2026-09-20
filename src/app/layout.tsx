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

const TITLE = "Holicruit — No black box. No cold applications. No silent no.";
const DESCRIPTION =
  "Just the whole person, measured and matched in the open — with an honest path forward for everyone. Holistic, opt-in, radically transparent hiring.";

/** Absolute base for social cards. Falls back to the production URL if the env var is unset/invalid. */
function appUrl(): URL {
  const fallback = "https://holicruit-production-f7af.up.railway.app";
  const u = process.env.NEXT_PUBLIC_APP_URL;
  try {
    return new URL(u && /^https?:\/\//.test(u) ? u : fallback);
  } catch {
    return new URL(fallback);
  }
}

export const metadata: Metadata = {
  metadataBase: appUrl(),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Holicruit",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Holicruit — holistic hiring, in the open" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
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
