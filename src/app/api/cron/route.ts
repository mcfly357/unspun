import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";

export const maxDuration = 300; // seconds — synthesis can take a while across several clusters
export const dynamic = "force-dynamic";

/**
 * Triggered by Vercel Cron (see vercel.json). Vercel signs cron requests with
 * this bearer token automatically when CRON_SECRET is set — see
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPipeline();
    return NextResponse.json({
      ok: true,
      clustersAssigned: result.clustersAssigned,
      clustersCreated: result.clustersCreated,
      storiesSynthesized: result.storiesSynthesized.length,
      headlines: result.storiesSynthesized.map((s) => s.headline),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
