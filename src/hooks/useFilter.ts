import { $, useTask$ } from "@builder.io/qwik";
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

  const loadEvents = $(async () => {
    const url = new URL(EVENTS_ENDPOINT);

    url.searchParams.set("toDate", evCtx.filterMaxDate.toISOString());

    url.searchParams.set(
      "geoLocation",
      evCtx.coord.longitude.toString() + "," + evCtx.coord.latitude.toString(),
    );

    url.searchParams.set("distance", "1km");

    if (evCtx.events.length) {
      const lastEvent = evCtx.events[evCtx.events.length - 1];

      for (const value of lastEvent._esMeta.sort) {
        url.searchParams.append("search_after[]", value.toString());
      }
    }

    return fetchEvents(url);
  });

  return {
    loadEvents,
  };
}
