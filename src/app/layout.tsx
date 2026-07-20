import type { Metadata, Viewport } from "next";
import { Figtree, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

// Brand type: Figtree (body/UI) + Instrument Serif (display headlines).
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

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
    <html lang="en" className={`${figtree.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
