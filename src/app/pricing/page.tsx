import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { BillingToggle } from "./billing-toggle";

const hmFeatures = [
  { feature: "Active roles", starter: "2", professional: "10", enterprise: "Unlimited" },
  { feature: "Apps per role", starter: "10", professional: "50", enterprise: "Unlimited" },
  { feature: "Match scoring", starter: "Score only", professional: "Full breakdown", enterprise: "Full + custom" },
  { feature: "Gap analysis", starter: "No", professional: "Yes", enterprise: "Yes" },
  { feature: "Team members", starter: "1", professional: "5", enterprise: "Unlimited" },
  { feature: "Priority support", starter: "No", professional: "Email", enterprise: "Dedicated" },
  { feature: "Custom branding", starter: "No", professional: "No", enterprise: "Yes" },
];

const hhFeatures = [
  { feature: "Role claims", free: "3", pro: "Unlimited" },
  { feature: "Monthly submissions", free: "10", pro: "Unlimited" },
  { feature: "Candidate profiles", free: "Browse", pro: "Full access" },
];

function Check() {
  return <span className="text-primary mt-0.5 shrink-0">&#10003;</span>;
}

export default async function PricingPage() {
  const session = await auth();
  const defaultTab =
    session?.user?.role === "HEADHUNTER" ? "headhunters" : "hiring-managers";

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary mb-4 md:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. Candidates always free.
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mx-auto mb-8">
              <TabsTrigger value="hiring-managers">Hiring Managers</TabsTrigger>
              <TabsTrigger value="headhunters">Headhunters</TabsTrigger>
            </TabsList>

            <TabsContent value="hiring-managers">
              <BillingToggle
                hmFeatures={hmFeatures}
              />
            </TabsContent>

            <TabsContent value="headhunters">
              <div className="flex gap-6 mb-8 max-w-2xl mx-auto snap-x snap-mandatory overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
                <Card className="shadow-sm snap-center min-w-[280px] md:min-w-0">
                  <CardHeader>
                    <CardTitle>Free</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">Free</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-start gap-2"><Check />3 role claims</li>
                      <li className="flex items-start gap-2"><Check />10 submissions/month</li>
                      <li className="flex items-start gap-2"><Check />Browse candidate profiles</li>
                    </ul>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-primary shadow-sm snap-center min-w-[280px] md:min-w-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Pro</CardTitle>
                      <Badge>Recommended</Badge>
                    </div>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">$49</span>/mo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-start gap-2"><Check />Unlimited role claims</li>
                      <li className="flex items-start gap-2"><Check />Unlimited submissions</li>
                      <li className="flex items-start gap-2"><Check />Full candidate profile access</li>
                    </ul>
                    <Button className="w-full" asChild>
                      <Link href="/register">Go Pro</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Compare Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Free</TableHead>
                        <TableHead>Pro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hhFeatures.map((row) => (
                        <TableRow key={row.feature}>
                          <TableCell className="font-medium">{row.feature}</TableCell>
                          <TableCell>{row.free}</TableCell>
                          <TableCell>{row.pro}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
