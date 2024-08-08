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
import { startOfToday } from "date-fns";
import { GOOGLE_ADSENSE_PUBLISHER_ID } from "./constants";

export default component$(() => {
  const mapStore = useStore<MapsStore>({ mapsLoader: null });

  const eventsStore = useStore<TEventsContext>({
    events: [],
    filterTags: [],
    filterCategories: [],
    filterMaxDate: startOfToday(),
    coord: {
      latitude: 0,
      longitude: 0,
    },
    locationName: "",
    distance: 1,
    priorityOrder: [],
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
        <meta
          name="google-adsense-account"
          content={GOOGLE_ADSENSE_PUBLISHER_ID}
        ></meta>
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
        {process.env.NODE_ENV === "production" && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          ></script>
        )}
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
