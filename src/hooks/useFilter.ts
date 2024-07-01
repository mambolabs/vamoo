import { $ } from "@builder.io/qwik";
import { fetchEvents } from "~/utils";
import { EVENTS_ENDPOINT } from "~/constants";
import { useEventsContext } from "~/context/events-context";

export function useFilter() {
  const evCtx = useEventsContext();

  const loadEvents = $(async () => {
    const url = new URL(EVENTS_ENDPOINT);

    url.searchParams.set("toDate", evCtx.filterMaxDate.toISOString());

    url.searchParams.set(
      "geoLocation",
      evCtx.coord.longitude.toString() + "," + evCtx.coord.latitude.toString(),
    );

    if (evCtx.filterCategories.length > 0) {
      evCtx.filterTags.forEach((cat) => {
        url.searchParams.append("categories", cat);
      });
    }

    if (evCtx.filterTags.length > 0) {
      evCtx.filterTags.forEach((tag) => {
        url.searchParams.append("tags", tag);
      });
    }

    url.searchParams.set("distance", `${evCtx.distance}km`);

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
