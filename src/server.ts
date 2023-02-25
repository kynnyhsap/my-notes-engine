import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { getXataClient } from "./xata.ts";
import {
  parseReadwiseBooks,
  parseReadwiseHighlights,
} from "./parse-readwise-highlights.ts";

interface MyPodcastNote {
  podcastTitle: string;

  episodeTitle: string;

  text: string;
}

interface MyNote {
  text: string;
}

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = { message: "Oh, so good to be alive!" };

  return;
});

router.post("/podcast-note", async (ctx) => {
  const data: MyPodcastNote = await ctx.request.body({ type: "json" }).value;

  console.log("Received note:", data);

  const xata = getXataClient();

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

  ctx.response.body = {
    receivedData: data,
    podcast,
    podcastEpisode,
    podcastEpisodeNote,
  };
  ctx.response.status = 200;
  return;
});

router.post("/note", async (ctx) => {
  const data: MyNote = await ctx.request.body({ type: "json" }).value;

  console.log("Received note:", data);

  const xata = getXataClient();

  const note = await xata.db.Notes.create({
    text: data.text,
    createdAt: new Date(),
  });

  console.log("Saved note:", note);

  ctx.response.body = {
    receivedData: data,
    note,
  };
  ctx.response.status = 200;
  return;
});

router.post("/sync-readwise-highlights", async (ctx) => {
  console.log("Parsing Readwise highlights...");

  const readwiseHighlights = await parseReadwiseHighlights();
  const readwiseBooks = await parseReadwiseBooks();

  const xata = getXataClient();

  const syncedBooks = await xata.db.Books.getAll();

  const syncedBookIds = syncedBooks.map((book) => book.readwiseId);
  const readwiseBooksToSync = readwiseBooks.filter(
    (readwiseBook) => !syncedBookIds.includes(readwiseBook.id)
  );

  console.log("Syncing books: ", readwiseBooksToSync);

  const newSyncedBooks = await xata.db.Books.create(
    readwiseBooksToSync.map(({ id, title, author, cover_image_url }) => {
      return {
        readwiseId: id,
        title,
        author,
        image: cover_image_url,
      };
    })
  );

  const allBooks = [...syncedBooks, ...newSyncedBooks];

  const syncedHighlights = await xata.db.BookHighlights.getAll();
  const syncedHighlightIds = syncedHighlights.map(
    ({ readwiseId }) => readwiseId
  );

  const readwiseHighlightsToSync = readwiseHighlights.filter(
    (readwiseHighlight) => !syncedHighlightIds.includes(readwiseHighlight.id)
  );

  console.log("Syncing highlights: ", readwiseHighlightsToSync);

  const newSyncedHighlights = await xata.db.BookHighlights.create(
    readwiseHighlightsToSync.map(
      ({ id, book_id, text, note, highlighted_at }) => {
        return {
          readwiseId: id,
          book: allBooks.find((book) => book.readwiseId === book_id)?.id,
          text,
          note,
          createdAt: new Date(highlighted_at),
        };
      }
    )
  );

  ctx.response.status = 200;
  ctx.response.body = {
    newSyncedBooks,
    newSyncedHighlights,
  };
  return;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", () => console.log("Up and running! "));

await app.listen({ port: 8080 });
