import "dotenv/config";
import { runPipeline } from "../lib/pipeline";
import { prisma } from "../lib/db";

async function main() {
  console.log("1/3 Fetching RSS feeds...");
  const result = await runPipeline();

  for (const r of result.fetch) {
    const status = r.ok ? `+${r.itemsNew} new (of ${r.itemsSeen})` : `FAILED: ${r.error}`;
    console.log(`  ${r.source}: ${status}`);
  }

  console.log("\n2/3 Clustering articles into stories...");
  console.log(`  assigned ${result.clustersAssigned} articles to existing clusters, created ${result.clustersCreated} new clusters`);

  console.log("\n3/3 Synthesizing stories with enough independent coverage...");
  console.log(`  ${result.storiesSynthesized.length} new stor${result.storiesSynthesized.length === 1 ? "y" : "ies"} synthesized`);
  for (const s of result.storiesSynthesized) {
    console.log(`  synthesized: "${s.headline}" (${s.generatedBy}${s.hasPhoto ? ", +photo" : ""})`);
  }

  if (result.imagesBackfilled > 0) {
    console.log(`\n  backfilled images for ${result.imagesBackfilled} older story/stories`);
  }

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect())
  .then(() => process.exit(0));
