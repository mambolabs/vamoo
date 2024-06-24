/* eslint-disable no-fallthrough */
import { $, useSignal, useTask$ } from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";

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
  const loc = useSignal<Loc | null>(null);

  const setLocation = $(async () => {
    const { lat, lon } = await lookupLocation();

    loc.value = {
      latitude: lat,
      longitude: lon,
    };
  });

  useTask$(
    () => {
      if (isServer) return;

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            loc.value = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
          },
          async (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
              case error.POSITION_UNAVAILABLE:
              case error.TIMEOUT:
                await setLocation();

                break;
              default:
                console.log("An unknown error occurred.");
                break;
            }
          },
        );
      } else {
        setLocation();
      }
    },
    { eagerness: "visible" },
  );

  return loc;
}
