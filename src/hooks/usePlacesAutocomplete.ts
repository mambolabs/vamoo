import { $, useSignal } from "@builder.io/qwik";
import { useEventsContext } from "~/context/events-context";
import { useGooeleMaps } from "~/context/google-maps-context";
import { useDebouncer$ } from "./useDebounce";
import { useCache } from "./useCache";

type PlacesAutocompleteOptions = {
  /**
   * fetchSuggestions debounce in ms
   * @default 200
   */
  debounce?: number;
  /**
   * Suggestions cache in seconds
   * @default 24 * 60 * 60
   */
  cacheDuration?: number | false;
  /**
   * Suggestions cache key
   * @default "upa"
   */
  cacheKey?: string;
};
export function usePlacesAutocomplete({
  debounce = 200,
  cacheDuration = 24 * 60 * 60,
  cacheKey = "upa",
}: PlacesAutocompleteOptions = {}) {
  const maps = useGooeleMaps();

  const evCtx = useEventsContext();

  const searchLocation = useSignal("");

  const isLoading = useSignal(false);

  const showSuggestions = useSignal(false);

  const props = useSignal({ debounce, cacheDuration, cacheKey });

  const suggestions = useSignal<google.maps.places.AutocompletePrediction[]>(
    [],
  );

  const { getCache$, setCache$, clearCache$ } = useCache<
    google.maps.places.AutocompletePrediction[]
  >(cacheKey, cacheDuration);

  const handlePlaceSelect$ = $(
    async (place: google.maps.places.AutocompletePrediction) => {
      if (!maps.mapsLoader) return;
      const { Geocoder } = await maps.mapsLoader.importLibrary("geocoding");

      const geocoder = new Geocoder();

      geocoder.geocode({ placeId: place.place_id }, (results, status) => {
        if (status === "OK" && results?.length) {
          showSuggestions.value = false;
          searchLocation.value = "";

          const { formatted_address, geometry } = results[0];

          evCtx.locationName = formatted_address;
          evCtx.coord = {
            latitude: geometry.location.lat(),
            longitude: geometry.location.lng(),
          };
        }
      });
    },
  );

  const fetchSuggestions$ = useDebouncer$(async () => {
    if (props.value.cacheDuration !== false) {
      const cachedData = await getCache$();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (cachedData[searchLocation.value]) {
        suggestions.value = cachedData[searchLocation.value].data;

        return;
      }
    }

    if (!maps.mapsLoader) return;

    const { AutocompleteService } =
      await maps.mapsLoader.importLibrary("places");

    if (!searchLocation.value || searchLocation.value.length < 3) {
      suggestions.value = [];
      showSuggestions.value = false;

      return;
    }

    isLoading.value = true;
    showSuggestions.value = false;

    const autocompleteService = new AutocompleteService();

    autocompleteService.getPlacePredictions(
      {
        input: searchLocation.value,
      },
      (predictions, status) => {
        if (status === "OK" && Array.isArray(predictions)) {
          suggestions.value = predictions;

          if (props.value.cacheDuration !== false) {
            setCache$(searchLocation.value, predictions);
          }

          showSuggestions.value = true;
        }

        isLoading.value = false;
      },
    );
  }, debounce);

  return {
    searchLocation,
    suggestions,
    loading: isLoading.value,
    fetchSuggestions$,
    handlePlaceSelect$,
    showSuggestions,
    clearAutocompleteCache$: clearCache$,
  };
}
