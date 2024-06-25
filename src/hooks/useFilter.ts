import {
  useComputed$,
  useSignal,
  useTask$,
  type Signal,
} from "@builder.io/qwik";
import { startOfToday } from "date-fns";
import { type TEvent } from "~/types";
import { useGeolocation } from "./useGeolocation";
import { fetchEvents } from "~/utils";
import { EVENTS_ENDPOINT } from "~/constants";
const today = startOfToday();

export function useFilter(events: Signal<TEvent[]>) {
  const filteredEvents = useSignal(events.value);

  const filterTags = useSignal<string[]>([]);

  const filterCategories = useSignal<string[]>([]);

  const filterMaxDate = useSignal<Date>(today);

  const categories = useComputed$(() => [
    ...new Set(events.value.flatMap((event) => event.categories)),
  ]);

  const loc = useGeolocation();

  useTask$(async ({ track }) => {
    const filterDate = track(() => filterMaxDate.value);

    if (filterDate.getTime() === today.getTime()) return;

    const url = new URL(EVENTS_ENDPOINT);

    url.searchParams.set("toDate", filterDate.toISOString());

    const newEvents = await fetchEvents(url);

    events.value = newEvents;
  });

  useTask$(({ track }) => {
    const tags = track(() => filterTags.value);

    const categories = track(() => filterCategories.value);

    const _events = track(() => events.value);

    const filterResults: TEvent[] = [];

    if (tags.length > 0) {
      filterResults.push(
        ..._events.filter((ev) => ev.tags.some((tag) => tags.includes(tag))),
      );
    }

    if (categories.length > 0) {
      filterResults.push(
        ..._events.filter((ev) =>
          ev.categories.some((cat) => categories.includes(cat)),
        ),
      );
    }

    if (tags.length || categories.length) {
      filteredEvents.value = filterResults;
    } else {
      filteredEvents.value = _events;
    }
  });

  return {
    loc,
    categories,
    filteredEvents,
    filterTags,
    filterCategories,
    filterMaxDate,
  };
}
