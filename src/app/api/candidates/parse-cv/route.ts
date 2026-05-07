import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { parseCV, CVParseError } from "@/lib/ai";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      select: { resumeUrl: true },
    });

    if (!profile?.resumeUrl) {
      return NextResponse.json(
        { error: "No CV uploaded" },
        { status: 400 }
      );
    }

    // Extract filename from URL path like /api/candidates/cv/filename.pdf
    const filename = profile.resumeUrl.split("/").pop();
    if (!filename) {
      return NextResponse.json(
        { error: "Invalid CV reference" },
        { status: 400 }
      );
    }

    const ext = path.extname(filename).toLowerCase();
    if (ext === ".doc") {
      return NextResponse.json(
        { error: "Legacy .doc format cannot be analyzed. Please upload a .pdf or .docx." },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "storage", "uploads", filename);
    const buffer = await readFile(filePath);

    if (ext === ".pdf") {
      const parsed = await parseCV({ pdf: buffer, fileName: filename });
      return NextResponse.json({ parsed });
    }

    // .docx
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const parsed = await parseCV({ text: result.value, fileName: filename });
    return NextResponse.json({ parsed });
  } catch (error) {
    console.error("CV re-parse error:", error);
    if (error instanceof CVParseError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
