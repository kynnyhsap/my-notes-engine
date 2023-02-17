import { Handler } from "@netlify/functions";
import { xata } from "../xata-client";
import { Journal } from "../journal-entry";

/*
 * This handler contains the logic to parse the JSON file exported from the Day One Journal app. Make sure you export only 'Podcasts' journal.
 * NOTE: Only works with my journaling style. If you are not me - forget it =)
 */
export const handler: Handler = async (event, context) => {
    const records = await xata.db.Podcasts.getAll();

    if (typeof event.body === "string") {
        const journal = JSON.parse(event.body) as Journal;
        const entries = journal.entries;
        console.log(JSON.parse(entries[20].richText));
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(records),
    };
};
