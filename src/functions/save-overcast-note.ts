import { Handler } from "@netlify/functions";
import { xata } from "../xata-client";

export const handler: Handler = async (event, context) => {
    const records = await xata.db.Podcasts.getAll();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(records),
    };
};
