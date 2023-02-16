import { Handler } from "@netlify/functions";

interface IPodcastNoteBody {}

export const handler: Handler = async (event, context) => {
    console.log({ data: event.body, envs: process.env });

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "I have never felt more alive 😤" }),
    };
};
