import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { parseCV, CVParseError, type ParsedCV } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${session.user.id}-${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "storage", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/api/candidates/cv/${filename}`;

    await prisma.candidateProfile.update({
      where: { userId: session.user.id },
      data: { resumeUrl: url },
    });

    // Attempt CV parsing (non-fatal — upload always succeeds)
    let parsed: ParsedCV | null = null;
    let parseError: string | null = null;

    try {
      if (ext === ".pdf") {
        parsed = await parseCV({ pdf: buffer, fileName: file.name });
      } else if (ext === ".docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        parsed = await parseCV({ text: result.value, fileName: file.name });
      } else {
        // .doc (legacy) — cannot parse
        parseError =
          "Legacy .doc format cannot be analyzed. Please upload a .pdf or .docx for AI parsing.";
      }
    } catch (error) {
      console.error("CV parse error:", error);
      parseError =
        error instanceof CVParseError
          ? error.message
          : "CV analysis failed. You can try re-analyzing later.";
    }

    return NextResponse.json({ url, parsed, parseError });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
