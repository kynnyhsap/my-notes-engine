import {
  buildClient,
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from '@xata.io/client';

import fetch from 'node-fetch';

const tables = [
  {
    name: 'Podcasts',
    columns: [
      {
        name: 'title',
        type: 'string',
      },
      {
        name: 'image',
        type: 'string',
      },
    ],
  },
  {
    name: 'PodcastEpisodes',
    columns: [
      {
        name: 'podcast',
        type: 'link',
        link: {
          table: 'Podcasts',
        },
      },
      {
        name: 'title',
        type: 'string',
      },
    ],
  },
  {
    name: 'PodcastEpisodeNotes',
    columns: [
      {
        name: 'createdAt',
        type: 'datetime',
      },
      {
        name: 'podcastEpisode',
        type: 'link',
        link: {
          table: 'PodcastEpisodes',
        },
      },
      {
        name: 'text',
        type: 'text',
      },
    ],
  },
  {
    name: 'Notes',
    columns: [
      {
        name: 'text',
        type: 'text',
      },
      {
        name: 'createdAt',
        type: 'datetime',
      },
    ],
  },
  {
    name: 'Books',
    columns: [
      {
        name: 'readwiseId',
        type: 'int',
        unique: true,
      },
      {
        name: 'image',
        type: 'string',
      },
      {
        name: 'title',
        type: 'string',
      },
      {
        name: 'author',
        type: 'string',
      },
    ],
  },
  {
    name: 'BookHighlights',
    columns: [
      {
        name: 'readwiseId',
        type: 'int',
        unique: true,
      },
      {
        name: 'text',
        type: 'text',
      },
      {
        name: 'note',
        type: 'text',
      },
      {
        name: 'createdAt',
        type: 'datetime',
      },
      {
        name: 'book',
        type: 'link',
        link: {
          table: 'Books',
        },
      },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Podcasts = InferredTypes['Podcasts'];
export type PodcastsRecord = Podcasts & XataRecord;

export type PodcastEpisodes = InferredTypes['PodcastEpisodes'];
export type PodcastEpisodesRecord = PodcastEpisodes & XataRecord;

export type PodcastEpisodeNotes = InferredTypes['PodcastEpisodeNotes'];
export type PodcastEpisodeNotesRecord = PodcastEpisodeNotes & XataRecord;

export type Notes = InferredTypes['Notes'];
export type NotesRecord = Notes & XataRecord;

export type Books = InferredTypes['Books'];
export type BooksRecord = Books & XataRecord;

export type BookHighlights = InferredTypes['BookHighlights'];
export type BookHighlightsRecord = BookHighlights & XataRecord;

export type DatabaseSchema = {
  Podcasts: PodcastsRecord;
  PodcastEpisodes: PodcastEpisodesRecord;
  PodcastEpisodeNotes: PodcastEpisodeNotesRecord;
  Notes: NotesRecord;
  Books: BooksRecord;
  BookHighlights: BookHighlightsRecord;
};

const DatabaseClient = buildClient();

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient({
    apiKey: process.env.XATA_API_KEY,
    databaseURL: process.env.XATA_DATABASE_URL,
    branch: process.env.XATA_FALLBACK_BRANCH,
    fetch,
  });

  return instance;
};
