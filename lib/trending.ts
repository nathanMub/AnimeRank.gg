import { prisma } from "@/lib/prisma";

export async function updateTrending() {
  const anime = await prisma.anime.findMany({
    include: { _count: { select: { votes: true } } },
  });

  const updates = anime.map((a) => {
    const score =
      (a.upvotes - a.downvotes) /
      Math.pow((Date.now() - a.createdAt.getTime()) / 3600000 + 2, 1.8);

    const trending = score + a._count.votes * 0.5;

    return prisma.anime.update({
      where: { id: a.id },
      data: { trendingScore: trending },
    });
  });

  await Promise.all(updates);
}
