import { Body, Controller, Get, Post } from '@nestjs/common';
import { parseReadwiseBooks, parseReadwiseHighlights } from './readwise';
import { getXataClient, XataClient } from './xata';

class MyNoteDTO {
  text: string;
}

class MyPodcastNoteDTO {
  podcastTitle: string;

  podcastImage?: string;

  episodeTitle: string;

  text: string;
}

@Controller()
export class AppController {
  private readonly xata: XataClient;

  constructor() {
    this.xata = getXataClient();
  }

  @Get()
  healthCheck(): string {
    return `No worries, I'm still alive.`;
  }

  @Post('note')
  async createNote(@Body() data: MyNoteDTO) {
    console.log('Received note:', data);

    const xata = getXataClient();

    const createdNote = await xata.db.Notes.create({
      text: data.text,
      createdAt: new Date(),
    });

    console.log('Saved note:', createdNote);

    return createdNote;
  }

  @Post('podcast-note')
  async createPodcastNote(@Body() data: MyPodcastNoteDTO) {
    console.log('Received podcast note:', data);

    let podcast = await this.xata.db.Podcasts.filter({
      title: data.podcastTitle,
    }).getFirst();

    if (!podcast) {
      podcast = await this.xata.db.Podcasts.create({
        title: data.podcastTitle,
        image: data.podcastImage,
      });
    }

    if (!podcast.image && data.podcastImage) {
      podcast = await this.xata.db.Podcasts.update(podcast.id, {
        image: data.podcastImage,
      });
    }

    let podcastEpisode = await this.xata.db.PodcastEpisodes.filter({
      title: data.episodeTitle,
    }).getFirst();

    if (!podcastEpisode) {
      podcastEpisode = await this.xata.db.PodcastEpisodes.create({
        title: data.episodeTitle,
        podcast: podcast.id,
      });
    }

    const podcastEpisodeNote = await this.xata.db.PodcastEpisodeNotes.create({
      text: data.text,
      podcastEpisode: podcastEpisode.id,
      createdAt: new Date(),
    });

    console.log('Saved podcast note:', podcastEpisodeNote);

    return {
      podcast,
      podcastEpisode,
      podcastEpisodeNote,
    };
  }

  @Post('highlights-sync')
  async syncReadwiseHighlights() {
    console.log('Parsing Readwise highlights...');

    const readwiseHighlights = await parseReadwiseHighlights();
    const readwiseBooks = await parseReadwiseBooks();

    const syncedBooks = await this.xata.db.Books.getAll();

    const syncedBookIds = syncedBooks.map((book) => book.readwiseId);
    const readwiseBooksToSync = readwiseBooks.filter(
      (readwiseBook) => !syncedBookIds.includes(readwiseBook.id),
    );

    console.log('Syncing books: ', readwiseBooksToSync);

    const newSyncedBooks = await this.xata.db.Books.create(
      readwiseBooksToSync.map(({ id, title, author, cover_image_url }) => {
        return {
          readwiseId: id,
          title,
          author,
          image: cover_image_url,
        };
      }),
    );

    const allBooks = [...syncedBooks, ...newSyncedBooks];

    const syncedHighlights = await this.xata.db.BookHighlights.getAll();
    const syncedHighlightIds = syncedHighlights.map(
      ({ readwiseId }) => readwiseId,
    );

    const readwiseHighlightsToSync = readwiseHighlights.filter(
      (readwiseHighlight) => !syncedHighlightIds.includes(readwiseHighlight.id),
    );

    console.log('Syncing highlights: ', readwiseHighlightsToSync);

    const newSyncedHighlights = await this.xata.db.BookHighlights.create(
      readwiseHighlightsToSync.map(
        ({ id, book_id, text, note, highlighted_at }) => {
          return {
            readwiseId: id,
            book: allBooks.find((book) => book.readwiseId === book_id)?.id,
            text,
            note,
            createdAt: new Date(highlighted_at),
          };
        },
      ),
    );

    return {
      newSyncedBooks,
      newSyncedHighlights,
    };
  }
}
