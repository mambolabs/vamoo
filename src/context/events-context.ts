import { createContextId, useContext } from "@builder.io/qwik";
import type { TEvent } from "~/types";

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
};

export const EventsContext = createContextId<TEventsContext>("EventsSTore");

export function useEventsContext() {
  return useContext(EventsContext);
}
