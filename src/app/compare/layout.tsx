import type { Metadata } from "next";
import { CompareNav } from "./_components/compare-nav";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Holicruit",
    default: "Compare | Holicruit",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <CompareNav />

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}
