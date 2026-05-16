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

function Check() {
  return <span className="text-primary mt-0.5 shrink-0">&#10003;</span>;
}

const milestoneRows = [
  { milestone: "Post a role", trigger: "Role published", fee: "Free" },
  { milestone: "Shortlist delivered", trigger: "First time viewing ranked candidates", fee: "$49" },
  { milestone: "Hire confirmed", trigger: "Both HM and candidate confirm", fee: "From $199" },
];

const hireFeeRows = [
  { type: "Permanent hire", fee: "$999" },
  { type: "Contract (<3 months)", fee: "$199" },
  { type: "Contract (3-6 months)", fee: "$399" },
  { type: "Contract (6+ months)", fee: "$699" },
];

export default async function PricingPage() {
  const session = await auth();
  const defaultTab =
    session?.user?.role === "HEADHUNTER" ? "headhunters" : "hiring-managers";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center px-4 md:px-6">
          <Link href="/" className="text-xl font-bold">
            Holicruit
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {session?.user ? (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Pay only when it works
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No subscriptions. No upfront fees. You pay at milestones — when
              you actually get value. Candidates are always free.
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mx-auto mb-8">
              <TabsTrigger value="hiring-managers">Hiring Managers</TabsTrigger>
              <TabsTrigger value="headhunters">Headhunters</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
            </TabsList>

            <TabsContent value="hiring-managers">
              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Post & Match</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">Free</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><Check />Post unlimited roles</li>
                      <li className="flex items-start gap-2"><Check />Candidates auto-scored</li>
                      <li className="flex items-start gap-2"><Check />Radar charts & gap reports</li>
                      <li className="flex items-start gap-2"><Check />Team skill mapping</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Shortlist</CardTitle>
                      <Badge>Per Role</Badge>
                    </div>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">$49</span>
                      <span className="text-muted-foreground"> / role</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><Check />Charged when you view ranked shortlist</li>
                      <li className="flex items-start gap-2"><Check />Candidate contact hidden until interview</li>
                      <li className="flex items-start gap-2"><Check />In-platform messaging included</li>
                      <li className="flex items-start gap-2"><Check />Full audit trail</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Hire</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">From $199</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><Check />Charged when hire confirmed</li>
                      <li className="flex items-start gap-2"><Check />Both parties must confirm</li>
                      <li className="flex items-start gap-2"><Check />Price depends on role type</li>
                      <li className="flex items-start gap-2"><Check />Talent pool for future roles</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Milestone Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milestoneRows.map((row) => (
                        <TableRow key={row.milestone}>
                          <TableCell className="font-medium">{row.milestone}</TableCell>
                          <TableCell>{row.trigger}</TableCell>
                          <TableCell>{row.fee}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hire Fees by Role Type</CardTitle>
                  <CardDescription>
                    Flat fees based on engagement type — no percentage of salary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Type</TableHead>
                        <TableHead>Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hireFeeRows.map((row) => (
                        <TableRow key={row.type}>
                          <TableCell className="font-medium">{row.type}</TableCell>
                          <TableCell>{row.fee}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headhunters">
              <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto mb-8">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">How You Earn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Default split:</strong> You get 60% of the hire fee when your candidate is placed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Custom bounties:</strong> Some HMs post fixed bounties (e.g. $3,000) — visible before you submit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Attribution window:</strong> 12 months — if an HM hires your candidate within a year, you get credit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Reputation score:</strong> Successful placements build your track record publicly</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Example Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span>Permanent hire ($999 fee)</span>
                        <span className="font-bold text-green-600">$599</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Contract 6mo+ ($699 fee)</span>
                        <span className="font-bold text-green-600">$419</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Contract 3-6mo ($399 fee)</span>
                        <span className="font-bold text-green-600">$239</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Custom bounty ($3,000)</span>
                        <span className="font-bold text-green-600">$3,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>No Subscription Needed</CardTitle>
                  <CardDescription>
                    Free to browse roles, submit candidates, and track your
                    pipeline. You earn on successful placements — no upfront cost.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/register">Start Submitting</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candidates">
              <div className="max-w-2xl mx-auto">
                <Card className="border-primary shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Always Free</CardTitle>
                      <Badge className="bg-green-100 text-green-800">$0 forever</Badge>
                    </div>
                    <CardDescription>
                      Holicruit is free for candidates. No hidden fees, no premium
                      gates on essential features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Full transparency:</strong> See your match score, radar chart, and gap report for every application</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Actionable feedback:</strong> Know exactly which skills to improve, with links to courses and opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Career tracking:</strong> Watch your skills grow over time with progress snapshots</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>Re-match alerts:</strong> Get notified when new roles match your updated profile</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check />
                        <span><strong>In-platform messaging:</strong> Communicate with hiring managers securely</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/register">Create Your Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Holicruit &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
