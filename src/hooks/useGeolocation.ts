/* eslint-disable no-fallthrough */
import { $, useVisibleTask$ } from "@builder.io/qwik";
import { useEventsContext } from "~/context/events-context";
import { useGooeleMaps } from "~/context/google-maps-context";

const LOCATION_STORE_KEY = "uloc";

export type Loc = {
  latitude: number;
  longitude: number;
};

type IPRegResult = {
  city: string;
  region: {
    code: string;
    name: string;
  };
  longitude: number;
  latitude: number;
};

async function lookupLocation() {
  try {
    const loc = localStorage.getItem(LOCATION_STORE_KEY);

    if (!loc) {
      const result = await fetch("https://api.ipregistry.co?key=tryout");

      if (!result.ok) return null;

      const data = await result.json();

      localStorage.setItem(LOCATION_STORE_KEY, JSON.stringify(data.location));

      return data.location as IPRegResult;
    }

    try {
      return JSON.parse(loc) as IPRegResult;
    } catch (err) {
      return null;
    }
  } catch (err) {
    console.log(err);

    return null;
  }
}

export function useGeolocation() {
  const evCtx = useEventsContext();

  const maps = useGooeleMaps();

  const setLocationName$ = $(async () => {
    function extractNames(places: google.maps.GeocoderResult) {
      let streetNumber = "";
      let route = "";
      let countryCode = "";
      let firstLongName = "";
      let firstShortName = "";

      const components = Array.isArray(places)
        ? places
        : places.address_components;

      components.forEach((component) => {
        if (component.types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (component.types.includes("route")) {
          route = component.long_name;
        }
        if (component.types.includes("country")) {
          countryCode = component.short_name;
        }
        if (!firstLongName && !firstShortName) {
          firstLongName = component.long_name;
          firstShortName = component.short_name;
        }
      });

      if (!streetNumber && !route && firstLongName && firstShortName) {
        return `${firstLongName}, ${firstShortName}`;
      }

      return `${streetNumber} ${route}, ${countryCode}`;
    }
    if (!maps.mapsLoader) return;

    const { latitude, longitude } = evCtx.coord;

    const { Geocoder } = await maps.mapsLoader.importLibrary("geocoding");

    const geocoder = new Geocoder();

    geocoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === "OK" && results?.length) {
          const { geometry } = results[0];

          evCtx.locationName = extractNames(results[0]);
          evCtx.coord = {
            latitude: geometry.location.lat(),
            longitude: geometry.location.lng(),
          };
        }
      },
    );
  });

  const setLocation$ = $(async () => {
    const res = await lookupLocation();

    if (!res) {
      return;
    }

    evCtx.coord = {
      latitude: res.latitude,
      longitude: res.longitude,
    };

    evCtx.locationName = `${res.city}, ${res.region.name}`;
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
}
