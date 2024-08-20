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

const POSTAL_CODE_TYPE = "postal_code";

const POSTAL_TOWN_TYPE = "postal_town";

const ROUTE_TYPE = "route";

const LOCALITY_TYPE = "locality";

const ADMIN_AREA_1_TYPE = "administrative_area_level_1";

const ADMIN_AREA_2_TYPE = "administrative_area_level_2";

const COUNTRY_TYPE = "country";

const NAME_COMPONENTS = [
  POSTAL_CODE_TYPE,
  POSTAL_TOWN_TYPE,
  ROUTE_TYPE,
  LOCALITY_TYPE,
  ADMIN_AREA_1_TYPE,
  ADMIN_AREA_2_TYPE,
  COUNTRY_TYPE,
];

/**
 *  Ideal location name for given addresses
 */
function getLocationName(
  address_components: google.maps.GeocoderAddressComponent[],
) {
  if (address_components.length === 0) return null;

  const postal_code = address_components.find((c) =>
    c.types.includes(POSTAL_CODE_TYPE),
  );

  const postal_town = address_components.find((c) =>
    c.types.includes(POSTAL_TOWN_TYPE),
  );

  const route = address_components.find((c) => c.types.includes(ROUTE_TYPE));

  const locality = address_components.find((c) =>
    c.types.includes(LOCALITY_TYPE),
  );

  const admin_area_level_1 = address_components.find((c) =>
    c.types.includes(ADMIN_AREA_1_TYPE),
  );

  const admin_area_level_2 = address_components.find((c) =>
    c.types.includes(ADMIN_AREA_2_TYPE),
  );

  const country = address_components.find((c) =>
    c.types.includes(COUNTRY_TYPE),
  );

  let first: string;

  const second = admin_area_level_1
    ? admin_area_level_1.long_name
    : country?.long_name;

  if (admin_area_level_2) {
    first = admin_area_level_2.long_name;
  } else if (locality) {
    first = locality.long_name;
  } else if (route) {
    first = route.long_name;
  } else if (postal_town) {
    first = postal_code
      ? `${postal_town.long_name} ${postal_code.long_name}`
      : postal_town.long_name;
  } else {
    return null;
  }

  return `${first}, ${second}`;
}

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

      const geocoder = new Geocoder();

      geocoder.geocode(
        { placeId: place.place_id, language: "pt-BR" },
        (results, status) => {
          if (status === "OK" && results?.length) {
            showSuggestions.value = false;
            searchLocation.value = "";

            const { geometry, address_components } = results[0];

            const _name = getLocationName(
              address_components.filter((comp) =>
                NAME_COMPONENTS.some((c) => comp.types.includes(c)),
              ),
            );

            console.log({ _name, address_components });

            evCtx.locationName = extractNames(results[0]);
            evCtx.coord = {
              latitude: geometry.location.lat(),
              longitude: geometry.location.lng(),
            };
          }
        },
      );
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
    isLoading,
    fetchSuggestions$,
    handlePlaceSelect$,
    showSuggestions,
    clearAutocompleteCache$: clearCache$,
  };
}
