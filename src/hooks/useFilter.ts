import { $ } from "@builder.io/qwik";
import { fetchEvents } from "~/utils";
import { EVENTS_ENDPOINT } from "~/constants";
import { useEventsContext } from "~/context/events-context";

type LoadEventsOptions = {
  /**
   *  If true, the events will be loaded from the server without search_after parameter
   */
  fresh?: boolean;
};
export function useFilter() {
  const evCtx = useEventsContext();

  const loadEvents = $(async ({ fresh = false }: LoadEventsOptions = {}) => {
    function createEventUrl({
      baseUrl,
      toDate,
      geoLocation,
      distance,
      categories,
      filterTags = null,
      fresh = false,
    }: any) {
      const url = new URL(baseUrl);
      const params = url.searchParams;

      // Add the toDate parameter
      params.append("toDate", toDate);

      // Add the geoLocation parameter
      params.append("geoLocation", geoLocation);

      // Add the distance parameter
      params.append("distance", distance);

      // Add categories (as an array with [])
      if (categories && categories.length > 0) {
        categories.forEach((category: string) => params.append("categories[]", category));
      }
   
      if (filterTags && filterTags.length >0) {
        filterTags.forEach((tag: string) => params.append("tags[]", tag));
      }

      if (evCtx.events.length && !fresh) {
        /**
         *  search_after allows us to load more events after the last one
         */
  
        const lastEvent = evCtx.events[evCtx.events.length - 1];

        lastEvent._esMeta.sort.forEach((tag: string|number) => params.append("tags[]", tag.toString()));
      }

      if (
        evCtx.priorityOrder.length &&
        evCtx.filterCategories.length &&
        evCtx.filterTags.length
      ) {
        /**
         *  priorityOrder will be considered only if we have categories and tags
         */
        evCtx.priorityOrder.forEach((value: string|number) => params.append("tags[]", value.toString()));

      }


      return url.toString();
    }

    // Example usage:
    const custom = createEventUrl({
      baseUrl: EVENTS_ENDPOINT,
      toDate: evCtx.filterMaxDate.toISOString(),
      geoLocation:
        evCtx.coord.longitude.toString() +
        "," +
        evCtx.coord.latitude.toString(),
      distance: `${evCtx.distance}km`,
      categories: evCtx.filterCategories,
      filterTags:evCtx.filterTags,
      fresh:fresh,
      events:evCtx.events
    });

    console.log("TEST URL", custom);
    
    return fetchEvents(custom);
  });

  return {
    loadEvents,
  };
}
