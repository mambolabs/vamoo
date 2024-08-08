import { AD_STEP } from "~/constants";
import type { TEvent } from "~/types";

export async function fetchEvents(url: URL) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return [] as TEvent[];
    }

    const data = await response.json();

    return data.details.results as TEvent[];
  } catch (err) {
    console.log(err);

    return [] as TEvent[];
  }
}

export function canShowAds(index: number) {
  if (index === 0) {
    return false;
  }

  return (index + 1) % AD_STEP === 0;
}

export function getDistanceKm(distance: number) {
  return distance / 1000;
}
