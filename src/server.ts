import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { getXataClient } from "./xata.ts";

interface MyPodcastNote {
  podcastTitle: string;

  episodeTitle: string;

  text: string;
}

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = { message: "Oh, so good to be alive!" };
});

router.post("/podcast-note", async (ctx) => {
  const xata = getXataClient();
  const data: MyPodcastNote = await ctx.request.body({ type: "json" }).value;

  console.log("Received note:", data);

  let podcast = await xata.db.Podcasts.filter({
    title: data.podcastTitle,
  }).getFirst();
  if (!podcast) {
    podcast = await xata.db.Podcasts.create({ title: data.podcastTitle });
  }

  let podcastEpisode = await xata.db.PodcastEpisodes.filter({
    title: data.episodeTitle,
  }).getFirst();
  if (!podcastEpisode) {
    podcastEpisode = await xata.db.PodcastEpisodes.create({
      title: data.episodeTitle,
      podcast: podcast.id,
    });
  }

  const podcastEpisodeNote = await xata.db.PodcastEpisodeNotes.create({
    text: data.text,
    podcastEpisode: podcastEpisode.id,
    createdAt: new Date(),
  });

  console.log("Saved note:", podcastEpisodeNote);

  ctx.response.body = podcastEpisodeNote;
  ctx.response.status = 200;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", () => console.log("Up and running!"));

await app.listen({ port: 8080 });
