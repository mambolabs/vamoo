import type { NoSerialize } from "@builder.io/qwik";
import { createContextId, useContext } from "@builder.io/qwik";
import type { Loader } from "@googlemaps/js-api-loader";

export type MapsStore = {
  mapsLoader: NoSerialize<Loader> | null;
};

export const MapsContext = createContextId<MapsStore>("MapsStore");

export function useGooeleMaps() {
  const mapStore = useContext(MapsContext);

  return mapStore;
}
