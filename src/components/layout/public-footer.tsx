import Link from "next/link";

const productLinks = [
  { label: "How It Works", href: "/compare" },
  { label: "Pricing", href: "/pricing" },
  { label: "Sign Up", href: "/register" },
];

const forLinks = [
  { label: "Hiring Managers", href: "/compare/hiring-managers" },
  { label: "Headhunters", href: "/compare/headhunters" },
  { label: "Candidates", href: "/register" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "mailto:hello@holicruit.com" },
];

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <p className="text-lg font-bold tracking-tight">
              Holi<span className="text-primary">cruit</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Direct. Transparent. Efficient.
              <br />
              Connecting hiring managers with specialized recruiters.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Product</p>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">For</p>
            <ul className="space-y-2">
              {forLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Legal</p>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          Holicruit &copy; {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
