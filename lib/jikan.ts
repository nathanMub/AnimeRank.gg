const BASE = "https://api.jikan.moe/v4";

async function fetcher(url: string, revalidate = 3600) {
  const res = await fetch(url, {
    next: { revalidate },
  });

  if (!res.ok) throw new Error("Jikan fetch failed");
  return res.json();
}

export function getAnimeById(id: number) {
  return fetcher(`${BASE}/anime/${id}/full`, 86400);
}

export function searchAnime(q: string) {
  return fetcher(
    `${BASE}/anime?q=${encodeURIComponent(q)}&limit=10&sfw`,
    3600
  );
}

export function getTopAnime(page = 1) {
  return fetcher(`${BASE}/top/anime?page=${page}`, 3600);
}
