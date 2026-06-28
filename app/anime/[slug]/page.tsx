import { getAnimeById } from "@/lib/jikan";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const id = Number(params.slug.split("-").pop());

  const [{ data }, db] = await Promise.all([
    getAnimeById(id),
    prisma.anime.findUnique({ where: { id } }),
  ]);

  const title = `${data.title} - AnimeRank.gg`;
  const description = `Vote ${data.title}. Score: ${
    db?.upvotes ?? 0
  } upvotes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [data.images.jpg.large_image_url],
      type: "website",
    },
  };
}

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const id = Number(params.slug.split("-").pop());

  const { data } = await getAnimeById(id);
  const db = await prisma.anime.findUnique({ where: { id } });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: data.title,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (
        (db?.upvotes ?? 0) /
        Math.max((db?.upvotes ?? 1) + (db?.downvotes ?? 0), 1) *
        10
      ).toFixed(1),
      reviewCount: (db?.upvotes ?? 0) + (db?.downvotes ?? 0),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>{data.title}</div>
    </>
  );
}
