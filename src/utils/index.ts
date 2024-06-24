import type { TEvent } from "~/types";

export async function fetchEvents(url: URL) {
  const response = await fetch(url);

  const data = await response.json();

  return data.details.results as TEvent[];
}
