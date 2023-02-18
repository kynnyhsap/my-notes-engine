import { buildClient } from "https://cdn.skypack.dev/@xata.io/client?dts";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "https://cdn.skypack.dev/@xata.io/client?dts";

const tables = [
  {
    name: "Podcasts",
    columns: [
      { name: "title", type: "string" },
      { name: "image", type: "string" },
    ],
  },
  {
    name: "PodcastEpisodes",
    columns: [
      { name: "podcast", type: "link", link: { table: "Podcasts" } },
      { name: "title", type: "string" },
    ],
  },
  {
    name: "PodcastEpisodeNotes",
    columns: [
      { name: "createdAt", type: "datetime" },
      {
        name: "podcastEpisode",
        type: "link",
        link: { table: "PodcastEpisodes" },
      },
      { name: "text", type: "text" },
    ],
  },
  {
    name: "Notes",
    columns: [
      { name: "createdAt", type: "datetime" },
      { name: "text", type: "text" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Podcasts = InferredTypes["Podcasts"];
export type PodcastsRecord = Podcasts & XataRecord;

export type PodcastEpisodes = InferredTypes["PodcastEpisodes"];
export type PodcastEpisodesRecord = PodcastEpisodes & XataRecord;

export type PodcastEpisodeNotes = InferredTypes["PodcastEpisodeNotes"];
export type PodcastEpisodeNotesRecord = PodcastEpisodeNotes & XataRecord;

export type Notes = InferredTypes["Notes"];
export type NotesRecord = Notes & XataRecord;

export type DatabaseSchema = {
  Podcasts: PodcastsRecord;
  PodcastEpisodes: PodcastEpisodesRecord;
  PodcastEpisodeNotes: PodcastEpisodeNotesRecord;
  Notes: NotesRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Andriy-Pashynnyk-s-workspace-0j5g5v.eu-west-1.xata.sh/db/my-notes-engine",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient({
    apiKey: Deno.env.get("XATA_API_KEY"),
    databaseURL: Deno.env.get("XATA_DATABASE_URL"),
    branch: Deno.env.get("XATA_FALLBACK_BRANCH"),
  });
  return instance;
};
