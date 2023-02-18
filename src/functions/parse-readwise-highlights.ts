import { Handler } from "@netlify/functions";
import { xata } from "../xata-client";
import fetch from "node-fetch";

/*
 *
 */
export const handler: Handler = async (event, context) => {
  const highlights = await fetchReadwiseHighlights();

  return {
    statusCode: 200,
    body: JSON.stringify(highlights),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

async function fetchReadwiseHighlights() {
  // Authorization: `Token ${process.env.READWISE_API_KEY}`,
  return fetch("https://readwise.io/api/v2/highlights?page_size=1000&page=4", {
    method: "GET",
    headers: {
      Authorization: `Token ${process.env.READWISE_API_KEY}`,
    },
  }).then((r) => r.json());
}
