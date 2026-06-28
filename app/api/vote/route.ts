import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Rate limit (Redis)
  const key = `vote:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);

  if (count > 10)
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const { animeId, type } = await req.json();

  const result = await prisma.$transaction(async (tx) => {
    await tx.anime.upsert({
      where: { id: animeId },
      create: {
        id: animeId,
        slug: `anime-${animeId}`,
      },
      update: {},
    });

    await tx.vote.upsert({
      where: {
        userId_animeId: { userId, animeId },
      },
      create: { userId, animeId, type },
      update: { type },
    });

    const [upvotes, downvotes] = await Promise.all([
      tx.vote.count({ where: { animeId, type: "UPVOTE" } }),
      tx.vote.count({ where: { animeId, type: "DOWNVOTE" } }),
    ]);

    await tx.anime.update({
      where: { id: animeId },
      data: { upvotes, downvotes },
    });

    await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: 10 } },
    });

    return { upvotes, downvotes };
  });

  return NextResponse.json(result);
}
