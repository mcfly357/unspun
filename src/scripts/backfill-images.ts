import "dotenv/config";
import { prisma } from "../lib/db";
import { topicLabel } from "../lib/topics";
import { findTopicImage } from "../lib/unsplash";

async function main() {
  const stories = await prisma.synthesizedStory.findMany({ where: { imageSource: "none" } });
  console.log(`Backfilling images for ${stories.length} stories...`);

  for (const story of stories) {
    const image = await findTopicImage(topicLabel(story.topic));
    if (image) {
      await prisma.synthesizedStory.update({
        where: { id: story.id },
        data: {
          imageUrl: image.url,
          imagePhotographer: image.photographerName,
          imagePhotographerUrl: image.photographerUrl,
          imageSource: "unsplash",
        },
      });
      console.log(`  "${story.headline.slice(0, 50)}..." -> photo by ${image.photographerName}`);
    } else {
      console.log(`  "${story.headline.slice(0, 50)}..." -> no match`);
    }
  }
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect())
  .then(() => process.exit(0));
