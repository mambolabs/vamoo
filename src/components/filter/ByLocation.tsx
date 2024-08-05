import { $, component$, type QRL, type Signal } from "@builder.io/qwik";
import RangeInput from "../range-input/RangeInput";
type ByLocationProps = {
  canSearchLocation: Signal<boolean>;
  searchLocation: Signal<string>;
  handleSearch$: QRL<() => void>;
  loading: boolean;
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
    loading,
    suggestions,
    showSuggestions,
    handlePlaceSelect$,
    localLocationName,
    localFilterDistance,
  }) => {
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
              onKeyDown$={$((e) => {
                if (e.key === "Enter") {
                  handleSearch$();
                }
              })}
              bind:value={searchLocation}
            />
          </div>

          {loading && (
            <div class="h-1 w-full overflow-hidden rounded-sm bg-[#ff7b0d]/10">
              <div class="h-full w-full origin-left-right animate-loading-progress bg-[#ff7b0d]"></div>
            </div>
          )}
          {showSuggestions.value && (
            <ul class="border border-[#858585] bg-white">
              {suggestions.value.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  role="option"
                  class="cursor-pointer border-t border-[#858585] px-2 py-1 text-sm first:border-none hover:bg-[#fafafa]"
                  onClick$={$(() => {
                    handlePlaceSelect$(suggestion);
                  })}
                >
                  <strong>{suggestion.structured_formatting.main_text}</strong>{" "}
                  <span>{suggestion.structured_formatting.secondary_text}</span>
                </li>
              ))}
            </ul>
          )}
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
