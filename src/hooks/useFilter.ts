import {
  useComputed$,
  useSignal,
  useTask$,
  type Signal,
} from "@builder.io/qwik";
import { type TEvent } from "~/types";

export function useFilter(events: Signal<TEvent[]>) {
  const filteredEvents = useSignal(events.value);

  const filterTags = useSignal<string[]>([]);

  const filterCategories = useSignal<string[]>([]);

  const categories = useComputed$(() => [
    ...new Set(events.value.flatMap((event) => event.categories)),
  ]);

  useTask$(({ track }) => {
    const tags = track(() => filterTags.value);

    const categories = track(() => filterCategories.value);

    track(() => events.value);

    const filterResults: TEvent[] = [];

    if (tags.length > 0) {
      filterResults.push(
        ...events.value.filter((ev) =>
          ev.tags.some((tag) => tags.includes(tag)),
        ),
      );
    }

    if (categories.length > 0) {
      filterResults.push(
        ...events.value.filter((ev) =>
          ev.categories.some((cat) => categories.includes(cat)),
        ),
      );
    }

    if (tags.length || categories.length) {
      filteredEvents.value = filterResults;
    } else {
      filteredEvents.value = events.value;
    }
  });

  return {
    categories,
    filteredEvents,
    filterTags,
    filterCategories,
  };
}
