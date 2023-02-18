import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { getXataClient } from "./xata.ts";
import { DayOneJournal, Journal, RichText } from "./day-one-journal.ts";
import { parse } from "npm:date-format-parse";

interface ParsedPodcastNote {
  text: string;
  createdAt: Date;
}

interface ParsedJournalEntry {
  podcastTitle: string;
  episodeTitle: string;
  notes: ParsedPodcastNote[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fillDatabase(parsedEntries: ParsedJournalEntry[]) {
  const xata = getXataClient();

  const podcasts = await Promise.all(
    [...new Set(parsedEntries.map(({ podcastTitle }) => podcastTitle))].map(
      async (title) => {
        const podcast = await xata.db.Podcasts.filter({
          title,
        }).getFirst();
        if (!podcast) {
          return xata.db.Podcasts.create({ title });
        }
        return podcast;
      }
    )
  );

  const podcastEpisodesWithNotes = await Promise.all(
    parsedEntries.map(async ({ podcastTitle, episodeTitle, notes }) => {
      const podcast = podcasts.find(({ title }) => title === podcastTitle);

      if (!podcast) {
        throw new Error(`Podcast '${podcastTitle}' not found`);
      }

      const podcastEpisode = await xata.db.PodcastEpisodes.create({
        title: episodeTitle,
        podcast: podcast.id,
      });

      const podcastEpisodeNotes = await Promise.all(
        notes.map(({ text, createdAt }) =>
          xata.db.PodcastEpisodeNotes.create({
            text,
            createdAt,
            podcastEpisode: podcastEpisode.id,
          })
        )
      );

      return {
        podcastEpisode,
        podcastEpisodeNotes,
      };
    })
  );

  return {
    podcasts,
    podcastEpisodesWithNotes,
  };
}

/*
 * NOTE: Only works with my journaling style. If you are not me - forget it =)
 */
function parseJournal(journal: Journal) {
  return journal.entries
    .map(parsePodcastEntry)
    .filter(Boolean) as ParsedJournalEntry[];
}

function parsePodcastEntry(entry: DayOneJournal): ParsedJournalEntry | null {
  if (!entry.richText) return null;

  const { contents } = JSON.parse(entry.richText) as RichText;

  const podcastTitle = contents[1].text?.trim();
  const episodeTitle = contents[0].text?.trim();

  if (!podcastTitle || !episodeTitle) return null;

  const parsedNotes = contents.reduce((notes, c, i) => {
    if (!c.attributes?.line?.quote) return notes;

    const text = c.text?.trim() ?? "";
    const createdAt =
      parse(contents[i - 4].text ?? "", "DD.MM.YYYY, HH:mm") ||
      entry.creationDate;

    const newNote = { text, createdAt };

    if (!text) return notes;

    return [...notes, newNote];
  }, [] as ParsedPodcastNote[]);

  return {
    podcastTitle,
    episodeTitle,
    notes: parsedNotes,
  };
}

const pathToJournal = Deno.args[0] || "./journal.json";
const journal = JSON.parse(await Deno.readTextFile(pathToJournal)) as Journal;
const parsed = parseJournal(journal);
const records = await fillDatabase(parsed);

console.log("Filled database with", { records });
