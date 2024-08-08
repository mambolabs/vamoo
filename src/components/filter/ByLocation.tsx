import { $, component$, type QRL, type Signal } from "@builder.io/qwik";
import RangeInput from "../range-input/RangeInput";
import { useDebouncer$ } from "~/hooks/useDebounce";
type ByLocationProps = {
  canSearchLocation: Signal<boolean>;
  searchLocation: Signal<string>;
  handleSearch$: QRL<() => void>;
  isLoading: Signal<boolean>;
  suggestions: Signal<google.maps.places.AutocompletePrediction[]>;
  showSuggestions: Signal<boolean>;
  handlePlaceSelect$: QRL<
    (suggestion: google.maps.places.AutocompletePrediction) => void
  >;
  localLocationName: Signal<string>;
  localFilterDistance: Signal<number>;
};

export default component$<ByLocationProps>(
  ({
    canSearchLocation,
    searchLocation,
    handleSearch$,
    isLoading,
    suggestions,
    showSuggestions,
    handlePlaceSelect$,
    localLocationName,
    localFilterDistance,
  }) => {
    const debouncedSearch = useDebouncer$(() => {
      handleSearch$();
    }, 500);

    return (
      <div class="h-full  space-y-6 px-5 py-6">
        <div class="space-y-2">
          <p class="text-xl font-bold">Onde?</p>
          <p>Selecione onde voce quer procurar</p>

          <div class="relative text-[#9e9e9e] focus-within:text-[#ff7b0d]">
            <svg
              class="absolute left-2 top-1/2 h-auto w-5 -translate-y-1/2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6"
              />
            </svg>

            <input
              id="location-search"
              placeholder="Endereço"
              type="text"
              class="w-full rounded-lg border-2 border-[#9e9e9e] p-2 pl-8 caret-[#ff7b0d] focus:text-[#9e9e9e]  focus:outline-[#ff7b0d]"
              name="location"
              disabled={!canSearchLocation.value}
              onKeyDown$={$((e, el) => {
                if (e.key === "Enter") {
                  handleSearch$();
                }

                if (el.value.length > 3) {
                  debouncedSearch();

                  return;
                }

                if (el.value.length === 0) {
                  showSuggestions.value = false;
                }
              })}
              bind:value={searchLocation}
            />
          </div>

          {isLoading.value && (
            <div class="h-1 w-full overflow-hidden rounded-sm bg-[#ff7b0d]/10">
              <div class="h-full w-full origin-left-right animate-loading-progress bg-[#ff7b0d]"></div>
            </div>
          )}
          {showSuggestions.value && (
            <ul class="overflow-hidden rounded-2xl bg-white shadow-lg">
              {suggestions.value.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  role="option"
                  class="relative flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm after:absolute after:bottom-0 after:left-2 after:h-[.5px] after:w-[calc(100%-1rem)] after:-translate-y-1/2 after:bg-[#e0e0e0] after:content-[''] first:border-none last:after:content-none hover:bg-[#fafafa] "
                  onClick$={$(() => {
                    handlePlaceSelect$(suggestion);
                  })}
                >
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-auto w-6 text-[#e0e0e0]"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-[#ff7b0d]">
                      <strong>
                        {suggestion.structured_formatting.main_text}
                      </strong>
                    </p>
                    <span class="text-sm text-[#a0a0a0]">
                      {suggestion.structured_formatting.secondary_text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!showSuggestions.value && (
            <div class="flex flex-wrap gap-2">
              {localLocationName.value && (
                <div class="flex items-center gap-1.5 rounded-full border border-[#858585] px-3 py-1">
                  <span class="text-sm font-medium">
                    {localLocationName.value}
                  </span>
                  <button
                    type="button"
                    onClick$={$(() => (localLocationName.value = ""))}
                  >
                    <svg
                      class="h-auto w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                    >
                      <path
                        fill="currentColor"
                        d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12"
                      />
                      <path
                        fill="currentColor"
                        d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div class="space-y-2">
          <p class="text-xl font-bold">Distancia</p>
          <p>Selecione ate qual distancia voce esta disposto a ir</p>

          <div class="px-2">
            <RangeInput
              min={1}
              max={30}
              value={localFilterDistance.value}
              handleChange={$((value) => {
                localFilterDistance.value = value;
              })}
            />

            <p class="font-semibold text-[#ff7400]">
              {localFilterDistance.value} km
            </p>
          </div>
        </div>
      </div>
    );
  },
);
