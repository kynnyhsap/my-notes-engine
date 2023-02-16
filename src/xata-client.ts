import { XataClient } from "./xata";
import fetch from "node-fetch";

let instance: XataClient | undefined = undefined;

/*
 * This is a custom function to get Xata Client with node-fetch override.
 */
const xataClient = () => {
    if (instance) return instance;

    instance = new XataClient({
        fetch: fetch,
        databaseURL: process.env.XATA_DATABASE_URL,
        apiKey: process.env.XATA_API_KEY,
        branch: process.env.XATA_BRANCH,
    });
    return instance;
};

const xata = xataClient();

export { xata };
