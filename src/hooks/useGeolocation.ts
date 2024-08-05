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

  const res = (await fetch(`https://ip-api.com/json/${ip}`).then((res) =>
    res.json(),
  )) as GeoLocationResponse;

  return res;
}

export function useGeolocation() {
  const evCtx = useEventsContext();

  const maps = useGooeleMaps();

  const setLocationName$ = $(async () => {
    if (!maps.mapsLoader) return;

    const { latitude, longitude } = evCtx.coord;

    const { Geocoder } = await maps.mapsLoader.importLibrary("geocoding");

    const geocoder = new Geocoder();

    geocoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === "OK" && results?.length) {
          const { formatted_address, geometry } = results[0];

          evCtx.locationName = formatted_address;
          evCtx.coord = {
            latitude: geometry.location.lat(),
            longitude: geometry.location.lng(),
          };
        }
      },
    );
  });

  const setLocation$ = $(async () => {
    const { lat, lon } = await lookupLocation();

    evCtx.coord = {
      latitude: lat,
      longitude: lon,
    };

    await setLocationName$();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          evCtx.coord = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          await setLocationName$();
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

  // // eslint-disable-next-line qwik/no-use-visible-task
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
  //         const { formatted_address, geometry } = results[0];

  //         evCtx.locationName = formatted_address;
  //         evCtx.coord = {
  //           latitude: geometry.location.lat(),
  //           longitude: geometry.location.lng(),
  //         };
  //       }
  //     },
  //   );
  // });
}
