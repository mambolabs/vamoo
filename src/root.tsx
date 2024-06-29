import {
  component$,
  noSerialize,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/common/Head";

import { MapsContext, type MapsStore } from "~/context/google-maps-context";
import { Loader } from "@googlemaps/js-api-loader";
import type { TEventsContext } from "~/context/events-context";
import { EventsContext } from "~/context/events-context";

import "./global.css";

export default component$(() => {
  const mapStore = useStore<MapsStore>({ mapsLoader: null });

  const eventsStore = useStore<TEventsContext>({
    events: [],
    filteredEvents: [],
    filterTags: [],
    filterCategories: [],
    filterMaxDate: new Date(),
    coord: {
      latitude: 0,
      longitude: 0,
    },
    locationName: "",
  });

  useContextProvider(MapsContext, mapStore);
  useContextProvider(EventsContext, eventsStore);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY as string;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    mapStore.mapsLoader = noSerialize(loader);
  });

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
