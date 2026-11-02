import "dotenv/config";
import { prisma } from "../lib/db";
import { SOURCES } from "../lib/sources";
import { majorityRegion } from "../lib/regions";
import { getStoryStatus } from "../lib/storyStatus";

async function main() {
  console.log("1/2 Backfilling Source.region...");
  for (const def of SOURCES) {
    const result = await prisma.source.updateMany({
      where: { name: def.name },
      data: { region: def.region },
    });
    if (result.count > 0) console.log(`  ${def.name} -> ${def.region}`);
  }

  console.log("\n2/2 Backfilling SynthesizedStory.region and .status...");
  const stories = await prisma.synthesizedStory.findMany({
    include: { cluster: { include: { articles: { include: { source: true } } } } },
  });

  let updated = 0;
  for (const story of stories) {
    const region = majorityRegion(story.cluster.articles.map((a) => a.source.region));
    const status = getStoryStatus({
      disputedClaims: JSON.parse(story.disputedClaims),
      unconfirmed: JSON.parse(story.unconfirmed),
    }).tone;

    await prisma.synthesizedStory.update({
      where: { id: story.id },
      data: { region, status },
    });
    updated++;
  }
  console.log(`  updated ${updated} stories`);

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect())
  .then(() => process.exit(0));
