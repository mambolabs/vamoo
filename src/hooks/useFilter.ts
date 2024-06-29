import { useTask$ } from "@builder.io/qwik";
import { startOfToday } from "date-fns";
import { type TEvent } from "~/types";
import { fetchEvents } from "~/utils";
import { EVENTS_ENDPOINT } from "~/constants";
import { useEventsContext } from "~/context/events-context";
const today = startOfToday();

export function useFilter() {
  const evCtx = useEventsContext();

  useTask$(async ({ track }) => {
    const filterDate = track(() => evCtx.filterMaxDate);

    if (filterDate.getTime() === today.getTime()) return;

    const url = new URL(EVENTS_ENDPOINT);

    url.searchParams.set("toDate", filterDate.toISOString());

    evCtx.events = await fetchEvents(url);
  });

  useTask$(({ track }) => {
    const tags = track(() => evCtx.filterTags);

    const categories = track(() => evCtx.filterCategories);

    const events = track(() => evCtx.events);

    const filterResults: TEvent[] = [];

    if (tags.length > 0) {
      filterResults.push(
        ...events.filter((ev) => ev.tags.some((tag) => tags.includes(tag))),
      );
    }

    if (categories.length > 0) {
      filterResults.push(
        ...events.filter((ev) =>
          ev.categories.some((cat) => categories.includes(cat)),
        ),
      );
    }

    if (tags.length || categories.length) {
      evCtx.filteredEvents = filterResults;
    } else {
      evCtx.filteredEvents = events;
    }
  });
}
