const HIGHLIGHTS_ENDPOINT = 'https://readwise.io/api/v2/highlights';
const BOOKS_ENDPOINT = 'https://readwise.io/api/v2/books';

const READWISE_API_KEY = process.env.READWISE_API_KEY;

export interface ReadwiseHighlight {
  id: number;
  book_id: number;

  text: string;
  note: string;

  highlighted_at: string;

  // location: string;
  // location_type: string;
  // url: string | null;
  // color: string;
  // updated: string;
  // tags: string[];
}

export interface ReadwiseBook {
  id: number;

  title: string;
  author: string;

  cover_image_url: string;

  // category: string;
  // source: string;
  // num_highlights: number;
  // last_highlighted_at: string | null;
  // updated: string;
  // cover_image_width: number;
  // tags: string[];
  // document_note: string;
}

async function parseReadwiseItems(endpoint: string) {
  const headers = {
    Authorization: `Token ${READWISE_API_KEY}`,
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

export function parseReadwiseHighlights(): Promise<ReadwiseHighlight[]> {
  return parseReadwiseItems(HIGHLIGHTS_ENDPOINT);
}

export function parseReadwiseBooks(): Promise<ReadwiseBook[]> {
  return parseReadwiseItems(BOOKS_ENDPOINT);
}
