import { Handler } from "@netlify/functions";
import { xata } from "../xata-client";
import { Journal, JournalEntry, RichText } from "../journal-entry";
import { parse } from "date-format-parse";

interface ParsedPodcastNote {
    text: string;
    createdAt: Date;
}

interface ParsedJournalEntry {
    podcastTitle: string;
    episodeTitle: string;
    notes: ParsedPodcastNote[];
}

const LIMIT = 10;

/*
 * This handler contains the logic to parse the JSON file exported from the Day One Journal app.
 * Make sure you export only 'Podcasts' journal. Intended for one-time use only.
 *
 * NOTE: Only works with my journaling style. If you are not me - forget it =)
 *
 * NOTE 2: Functions is limited to 10s of execution time. If you have a lot of notes - break parsed data into chunks of 10 and use page=n query param.
 */
export const handler: Handler = async (event, context) => {
    if (!event.body) {
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "No body, no party" }),
        };
    }

    const page = Number(event.queryStringParameters?.page || 1);

    const parsed = parseJournal(JSON.parse(event.body) as Journal);

    const parsedPage = parsed.slice(LIMIT * (page - 1), LIMIT * page);
    const records = await fillDatabase(parsedPage);

    return {
        statusCode: 200,
        body: JSON.stringify({ page, parsed: parsedPage, records }),
        headers: {
            "Content-Type": "application/json",
        },
    };
};

async function fillDatabase(parsedEntries: ParsedJournalEntry[]) {
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
            const podcast = podcasts.find(
                ({ title }) => title === podcastTitle
            );

            if (!podcast)
                throw new Error(`Podcast '${podcastTitle}' not found`);

            const podcastEpisode = await xata.db.PodcastEpisodes.create({
                title: episodeTitle,
                podcast: podcast.id,
            });

            const podcastEpisodeNotes = await Promise.all(
                notes.map(async ({ text, createdAt }) =>
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

function parseJournal(journal: Journal) {
    return journal.entries
        .map(parsePodcastEntry)
        .filter(Boolean) as ParsedJournalEntry[];
}

function parsePodcastEntry(entry: JournalEntry): ParsedJournalEntry | null {
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
