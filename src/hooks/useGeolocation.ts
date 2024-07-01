/* eslint-disable no-fallthrough */
import { $, useVisibleTask$ } from "@builder.io/qwik";
import { useEventsContext } from "~/context/events-context";
import { useGooeleMaps } from "~/context/google-maps-context";

export type Loc = {
  latitude: number;
  longitude: number;
};

type GeoLocationResponse = {
  status: "success";
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};

async function lookupLocation() {
  const trace = await fetch("https://1.0.0.1/cdn-cgi/trace").then((res) =>
    res.text(),
  );

  const [item] = trace.split("\n").filter((item) => item.startsWith("ip="));

  const ip = item.replace("ip=", "");

  const res = (await fetch(`http://ip-api.com/json/${ip}`).then((res) =>
    res.json(),
  )) as GeoLocationResponse;

  return res;
}

export function useGeolocation() {
  const evCtx = useEventsContext();

  const maps = useGooeleMaps();

  const setLocation$ = $(async () => {
    const { lat, lon, regionName } = await lookupLocation();

    evCtx.locationName = regionName;

    evCtx.coord = {
      latitude: lat,
      longitude: lon,
    };
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          evCtx.coord = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        },
        async (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
            case error.POSITION_UNAVAILABLE:
            case error.TIMEOUT:
              await setLocation$();

              break;
            default:
              console.log("An unknown error occurred.");
              break;
          }
        },
      );
    } else {
      await setLocation$();
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  // useVisibleTask$(async ({ track }) => {
  //   const loc = track(() => evCtx.coord);

  //   const mapsLoader = track(() => maps.mapsLoader);

  //   if (!mapsLoader) return;

  //   const { latitude, longitude } = loc;

  //   const { Geocoder } = await mapsLoader.importLibrary("geocoding");

  //   const geocoder = new Geocoder();

  //   geocoder.geocode(
  //     { location: { lat: latitude, lng: longitude } },
  //     (results, status) => {
  //       if (status === "OK" && results?.length) {
  //         evCtx.locationName = results[0].formatted_address;
  //       }
  //     },
  //   );
  // });
}
