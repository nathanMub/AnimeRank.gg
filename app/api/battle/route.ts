import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const count = await prisma.anime.count();

  const [a, b] = await Promise.all([
    prisma.anime.findFirst({
      skip: Math.floor(Math.random() * count),
      orderBy: { id: "asc" },
    }),
    prisma.anime.findFirst({
      skip: Math.floor(Math.random() * count),
      orderBy: { id: "asc" },
    }),
  ]);

  if (!a || !b) {
    return NextResponse.json({ error: "Not enough anime" }, { status: 400 });
  }

  return NextResponse.json({ anime1: a, anime2: b });
}
