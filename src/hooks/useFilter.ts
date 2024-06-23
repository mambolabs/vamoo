import {
  $,
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
    track(() => filterTags.value);
    track(() => filterCategories.value);
    track(() => events.value);

    if (filterTags.value.length > 0) {
      filteredEvents.value = events.value.filter((ev) =>
        ev.tags.some((tag) => filterTags.value.includes(tag)),
      );
    }

    if (filterCategories.value.length > 0) {
      filteredEvents.value = events.value.filter((ev) =>
        ev.categories.some((cat) => filterCategories.value.includes(cat)),
      );
    }
  });

  return {
    categories,
    filteredEvents,
    filterTags,
    filterCategories,
    addFilterTag: $((tag: string) => {
      filterTags.value = [...filterTags.value, tag];
    }),
    addFilterCategory: $((category: string) => {
      filterCategories.value = [...filterCategories.value, category];
    }),
  };
}
