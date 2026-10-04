"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

/** Public "Talk to us" form → stored lead. */
export async function submitLead(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const company = String(formData.get("company") ?? "").trim().slice(0, 160) || null;
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000) || null;
  const plan = String(formData.get("plan") ?? "").trim().slice(0, 40) || null;
  if (!name || !email.includes("@")) redirect(`/contact?error=1${plan ? `&plan=${plan}` : ""}`);

  await prisma.lead.create({
    data: { name, email, company, message, plan, source: plan ? "sales" : "contact" },
  });
  redirect("/contact?sent=1");
}
