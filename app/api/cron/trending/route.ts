import { NextResponse } from "next/server";
import { updateTrending } from "@/lib/trending";

export async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await updateTrending();

  return NextResponse.json({ success: true });
}
