import { createContextId, useContext } from "@builder.io/qwik";
import type { RelevanceFilterItem, TEvent } from "~/types";

export type TEventsContext = {
  events: TEvent[];
  filterTags: string[];
  filterCategories: string[];
  filterMaxDate: Date;
  coord: {
    latitude: number;
    longitude: number;
  };
  locationName: string;
  distance: number;
  priorityOrder: RelevanceFilterItem["order"][];
};

export const EventsContext = createContextId<TEventsContext>("EventsSTore");

export function useEventsContext() {
  return useContext(EventsContext);
}
