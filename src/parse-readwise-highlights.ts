import { getXataClient } from "./xata.ts";

const HIGHLIGHTS_ENDPOINT = "https://readwise.io/api/v2/highlights";
const BOOKS_ENDPOINT = "https://readwise.io/api/v2/books";

async function parseReadwiseItems(endpoint: string) {
  const headers = {
    Authorization: `Token ${Deno.env.get("READWISE_API_KEY")}`,
  };

  const items = [];

  let { results, next } = await fetch(`${endpoint}?page_size=1000`, {
    headers,
  }).then((r) => r.json());

  items.push(...results);

  while (next) {
    const response = await fetch(next, { headers }).then((r) => r.json());

    next = response.next;

    items.push(...response.results);
  }

  return items;
}

const highlights = await parseReadwiseItems(HIGHLIGHTS_ENDPOINT);
const books = await parseReadwiseItems(BOOKS_ENDPOINT);

console.log({ books, highlights });
