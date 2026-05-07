import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { env } from "@/lib/env";
import { mintToken } from "@/lib/auth-tokens";
import { sendVerifyEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CANDIDATE", "HEADHUNTER", "HIRING_MANAGER"]),
  companyName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    let companyId: string | undefined;
    if (data.role === "HIRING_MANAGER" && data.companyName) {
      const company = await prisma.company.create({
        data: { name: data.companyName },
      });
      companyId = company.id;
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        companyId,
      },
    });

    // Create associated profile and free subscription
    if (data.role === "CANDIDATE") {
      await prisma.candidateProfile.create({
        data: { userId: user.id },
      });
    } else if (data.role === "HEADHUNTER") {
      const hhProfile = await prisma.headhunterProfile.create({
        data: { userId: user.id },
      });
      await prisma.subscription.create({
        data: {
          headhunterProfileId: hhProfile.id,
          plan: "FREE",
          status: "ACTIVE",
        },
      });
    } else if (data.role === "HIRING_MANAGER" && companyId) {
      await prisma.subscription.create({
        data: {
          companyId,
          plan: "STARTER",
          status: "ACTIVE",
        },
      });
    }

    // Fire and forget the verification email — never block registration on it.
    // We deliberately don't await: a Resend hiccup shouldn't 500 the signup.
    void (async () => {
      try {
        const token = await mintToken(user.id, "VERIFY_EMAIL");
        const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
        await sendVerifyEmail({
          to: user.email,
          name: user.name,
          verifyUrl,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to send verification email:", err);
      }
    })();

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
