// NOTE: In Google Cloud Console → API Key restrictions → Website restrictions,
// https://localhost:5173 is set as the approved referrer for this key.

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export interface BookResult {
  id: string;
  title: string;
  coverUrl: string | null;
}

export async function searchBooks(query: string, signal?: AbortSignal): Promise<BookResult[]> {
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20&fields=items(id,volumeInfo/title,volumeInfo/imageLinks)&key=${API_KEY}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);
  const data = await res.json();
  return (data.items ?? []).map((item: { id: string; volumeInfo?: { title?: string; imageLinks?: { thumbnail?: string } } }) => ({
    id: item.id,
    title: item.volumeInfo?.title ?? "",
    coverUrl: item.volumeInfo?.imageLinks?.thumbnail ?? null,
  }));
}
