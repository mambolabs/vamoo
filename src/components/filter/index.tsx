import {
  component$,
  useSignal,
  $,
  useTask$,
  useComputed$,
  useOnWindow,
} from "@builder.io/qwik";

import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import Calendar from "../Calendar";
import { Modal } from "../common/Modal";
import { isServer } from "@builder.io/qwik/build";
import {
  differenceInDays,
  format,
  formatRelative,
  startOfToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import RelevanceSortModal from "../modals/RelevanceSortModal";
import type { RelevanceFilterItem } from "~/types";
import { useEventsContext } from "~/context/events-context";
import { categories, MAX_TAGS } from "~/constants";
import { usePlacesAutocomplete } from "~/hooks/usePlacesAutocomplete";
import { useFilter } from "~/hooks/useFilter";
import ByLocation from "./ByLocation";
import TabButton from "./TabButton";
import ByTagsCategories from "./ByTagsCategories";

import MiniLogo from "~/media/mini_logo_vamoo.png?jsx";

const today = startOfToday();

/**
 *  This (in pixels) is used to determine when to show/hide the tags and categories filter
 */
const SCROLL_THRESHOLD = 250;

export function uniqueKeys(items: RelevanceFilterItem[]) {
  const seenKeys = new Set<string>();

  return items.filter((item) => {
    if (seenKeys.has(item.key)) {
      return false;
    } else {
      seenKeys.add(item.key);

      return true;
    }
  });
}

export default component$(() => {
  const evCtx = useEventsContext();

  const swiperElRef = useSignal<HTMLDivElement>();

  const showFilterModal = useSignal(false);

  const showRelevanceFilterModal = useSignal(false);

  const newTagInputRef = useSignal<HTMLInputElement>();

  const filterView = useSignal<"time" | "location" | "tags">("tags");

  const localMaxDate = useSignal(evCtx.filterMaxDate);

  const localFilterTags = useSignal(evCtx.filterTags);

  const localFilterCategories = useSignal(evCtx.filterCategories);

  const localFilterDistance = useSignal(evCtx.distance);

  const localLocationName = useSignal(evCtx.locationName);

  const { loadEvents } = useFilter();

  const {
    fetchSuggestions$,
    searchLocation,
    suggestions,
    isLoading,
    handlePlaceSelect$,
    showSuggestions,
  } = usePlacesAutocomplete();

  const hasFilters = useComputed$(() => {
    return evCtx.filterCategories.length > 0 || evCtx.filterTags.length > 0;
  });

  const canSearchLocation = useSignal(!isLoading.value);

  const relevanceFilterOptions = useSignal<RelevanceFilterItem[]>(() =>
    uniqueKeys([
      {
        title: "Eventos mais recentes",
        key: "recent",
        order: "time",
        isActive: true,
      },
      {
        title: "Eventos mais proximos",
        key: "nearest",
        order: "distance",
        isActive: true,
      },
      {
        title: "Minhas preferencias",
        key: "preferencias",
        order: "nice",
        isActive: hasFilters.value,
      },
    ]),
  );

  const hideFilters = useSignal(false);

  const handleClose$ = $(() => {
    localFilterCategories.value = evCtx.filterCategories;
    localFilterTags.value = evCtx.filterTags;
    localLocationName.value = evCtx.locationName;
    showFilterModal.value = false;
  });

  const addTag$ = $(() => {
    if (!newTagInputRef.value) return;

    const tag = newTagInputRef.value.value;

    if (!tag) return;

    if (localFilterTags.value.length === MAX_TAGS) return;

    localFilterTags.value = [
      ...new Set([...localFilterTags.value, tag.trim()]),
    ];

    newTagInputRef.value.value = "";
  });

  const tagsViewFilters$ = $(() => {
    if (localFilterTags.value.length) {
      evCtx.filterTags = localFilterTags.value;
    } else {
      evCtx.filterTags = [];
    }

    if (localFilterCategories.value.length) {
      evCtx.filterCategories = localFilterCategories.value;
    } else {
      evCtx.filterCategories = [];
    }
  });

  const locationFilter$ = $(() => {
    if (!localLocationName.value) return;
    evCtx.distance = localFilterDistance.value;
  });

  const timeFilter$ = $(() => {
    evCtx.filterMaxDate = localMaxDate.value;
  });

  const applyFilters = $(async () => {
    switch (filterView.value) {
      case "tags":
        tagsViewFilters$();
        break;
      case "location":
        locationFilter$();
        break;
      case "time":
        timeFilter$();
        break;
    }

    evCtx.events = await loadEvents({ fresh: true });

    showFilterModal.value = false;
  });

  const displayDate = useComputed$(() => {
    let [rel] = formatRelative(evCtx.filterMaxDate, today, {
      locale: ptBR,
    }).split(" ");

    if (differenceInDays(evCtx.filterMaxDate, today) > 6) {
      rel = format(evCtx.filterMaxDate, "eeee", { locale: ptBR });
    }

    const dateStr = format(evCtx.filterMaxDate, "dd MMM", {
      locale: ptBR,
    });

    return `${rel}, ${dateStr}`;
  });

  const filterByRelevance$ = $(async () => {
    showRelevanceFilterModal.value = false;

    evCtx.priorityOrder = relevanceFilterOptions.value.map((item) => {
      return item.order;
    });

    evCtx.events = await loadEvents({ fresh: true });
  });

  const filtersCount = useComputed$(() => {
    return evCtx.filterCategories.length + evCtx.filterTags.length;
  });

  useTask$(({ track }) => {
    const localSearch = track(() => localLocationName.value);

    canSearchLocation.value = !localSearch;
  });

  useTask$(({ track }) => {
    const name = track(() => evCtx.locationName);

    localLocationName.value = name;
  });

  useTask$(({ track }) => {
    const _hasFilters = track(() => hasFilters.value);

    const pref = relevanceFilterOptions.value.find((item) => {
      return item.key === "preferencias";
    });

    if (pref) {
      pref.isActive = _hasFilters;

      relevanceFilterOptions.value = [
        ...relevanceFilterOptions.value.filter(
          (opt) => opt.key !== "preferencias",
        ),
        pref,
      ];
    }
  });

  useTask$(
    ({ cleanup, track }) => {
      const view = track(() => filterView.value);

      if (isServer) return;

      const swiperInstance = new Swiper("#filter-slider", {
        modules: [Navigation],
        slidesPerView: 1,
      });

      switch (view) {
        case "tags":
          swiperInstance.slideTo(0);
          break;
        case "location":
          swiperInstance.slideTo(1);
          break;
        case "time":
          swiperInstance.slideTo(2);
          break;
      }

      cleanup(() => swiperInstance.destroy());
    },
    {
      eagerness: "visible",
    },
  );

  useTask$(() => {
    if (isServer) return;

    /**
     * Set priority order
     */
    evCtx.priorityOrder = relevanceFilterOptions.value.map((item) => {
      return item.order;
    });
  });

  useOnWindow(
    "scroll",
    $((ev) => {
      /**
       *  1024(px) is used beacause the home page has a fixed height from this width
       */
      if (window.innerWidth > 1024) {
        const target = ev.target as HTMLElement;

        if (target.scrollTop > SCROLL_THRESHOLD) {
          hideFilters.value = true;
        }

        return;
      }

      //  mobile
    }),
  );

  return (
    <>
      <div class="flex flex-col-reverse justify-center gap-1 rounded-2xl shadow-md lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:border lg:px-3 lg:py-3">
        <div class="flex flex-wrap gap-2 max-lg:p-2.5">
          <button
            onClick$={() => {
              filterView.value = "time";
              showFilterModal.value = true;
            }}
            type="button"
            class="flex items-center gap-1 rounded-full border border-[#0c9d0c] px-4 py-1 text-sm font-semibold capitalize text-[#5b5b5b]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="#0c9d0c"
                d="M19 19H5V8h14m0-5h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-2.47 8.06L15.47 10l-4.88 4.88l-2.12-2.12l-1.06 1.06L10.59 17z"
              />
            </svg>
            {displayDate.value}
          </button>
          {evCtx.locationName && (
            <button
              onClick$={() => {
                filterView.value = "location";
                showFilterModal.value = true;
              }}
              type="button"
              class="flex items-center gap-1 rounded-full border border-[#ff7400] px-4 py-1 text-sm text-[#5b5b5b]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 32 32"
              >
                <path
                  fill="#ff7400"
                  d="M16 2A11.013 11.013 0 0 0 5 13a10.9 10.9 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.9 10.9 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
                />
                <circle cx="16" cy="13" r="4" fill="none" />
              </svg>
              <strong>{evCtx.distance} km</strong> -{" "}
              <span class="font-normal">{evCtx.locationName}</span>
            </button>
          )}

          {filtersCount.value > 2 && hideFilters.value ? (
            <div>
              <button
                type="button"
                class="rounded-full border border-black px-4 py-1 text-sm font-semibold"
                onClick$={() => (hideFilters.value = false)}
              >
                +{filtersCount.value} Filtros
              </button>
            </div>
          ) : (
            <>
              {evCtx.filterCategories.map((category, index) => (
                <button
                  key={category + index}
                  onClick$={() => {
                    filterView.value = "tags";
                    showFilterModal.value = true;
                  }}
                  type="button"
                  class="rounded-full border bg-black px-4 py-1 text-sm font-semibold text-white"
                >
                  {category}
                </button>
              ))}

              {evCtx.filterTags.map((tag, index) => (
                <button
                  key={tag + index}
                  onClick$={() => {
                    filterView.value = "tags";
                    showFilterModal.value = true;
                  }}
                  type="button"
                  class="rounded-full border border-[#858585] px-3 py-1 text-sm font-bold"
                >
                  <strong>#</strong>
                  {tag}
                </button>
              ))}
            </>
          )}
        </div>
        <div class="flex items-center justify-between bg-black max-lg:p-2.5 lg:bg-white">
          <div class="flex items-center gap-2 lg:hidden">
            <button type="button" class="text-white">
              <svg
                class="h-auto w-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M3 18v-2h18v2zm0-5v-2h18v2zm0-5V6h18v2z"
                />
              </svg>
            </button>

            <MiniLogo class="h-4 w-auto" />
          </div>
          <div class="flex items-center gap-5">
            <button
              type="button"
              class="rounded-full border bg-black px-4 py-1 text-white lg:border-0 lg:px-5 lg:py-1.5 "
              onClick$={() => {
                filterView.value = "tags";

                showFilterModal.value = true;
              }}
            >
              Filtros
            </button>
            <button
              type="button"
              class="text-white lg:text-black"
              onClick$={() => {
                showRelevanceFilterModal.value = true;
              }}
            >
              <svg
                class="h-8 w-auto stroke-[1.2px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="4.5 3.5 18 17"
              >
                <g fill="none" stroke="currentColor">
                  <path stroke-linecap="round" d="M5 8h7m-7 4h7m-7 4h7"></path>
                  <path d="m19 20l3-3m-3 3l-3-3m3 3V4m0 0l-3 3m3-3l3 3"></path>
                </g>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={showFilterModal}
        onClose$={() => {
          showFilterModal.value = false;
        }}
        class="w-full [scrollbar-width:none] backdrop:bg-black/50  max-lg:h-full max-lg:!max-h-[100%] max-lg:!max-w-[100%] lg:w-3/4 lg:rounded-2xl xl:min-h-[70%] xl:w-[35%]"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-center justify-between bg-black px-5 py-3 text-white">
            <p class="text-xl font-semibold">Filtros</p>
            <button type="button" onClick$={handleClose$}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-6"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
                />
              </svg>
            </button>
          </div>

          <div class="relative isolate shadow-md">
            <div class="flex items-center justify-around py-3">
              <TabButton
                isActive={filterView.value === "tags"}
                onClick$={() => {
                  filterView.value = "tags";

                  const swiper = (swiperElRef.value as any).swiper as
                    | Swiper
                    | undefined;

                  if (!swiper) return;

                  swiper.slideTo(0);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-auto md:h-7"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M181.3 32.4c17.4 2.9 29.2 19.4 26.3 36.8l-9.8 58.8h95.1l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3s29.2 19.4 26.3 36.8l-9.7 58.8H416c17.7 0 32 14.3 32 32s-14.3 32-32 32h-68.9l-21.3 128H384c17.7 0 32 14.3 32 32s-14.3 32-32 32h-68.9l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.8-58.7h-95.2l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.7-58.9H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l21.3-128H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3zm5.8 159.6l-21.3 128h95.1l21.3-128z"
                  />
                </svg>
              </TabButton>

              <TabButton
                isActive={filterView.value === "location"}
                onClick$={() => {
                  filterView.value = "location";

                  const swiper = (swiperElRef.value as any).swiper as
                    | Swiper
                    | undefined;

                  if (!swiper) return;

                  swiper.slideTo(1);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-auto md:h-7"
                  viewBox="0 0 32 32"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  >
                    <circle cx="16" cy="11" r="4" />
                    <path d="M24 15c-3 7-8 15-8 15s-5-8-8-15s2-13 8-13s11 6 8 13" />
                  </g>
                </svg>
              </TabButton>

              <TabButton
                isActive={filterView.value === "time"}
                onClick$={() => {
                  filterView.value = "time";
                  const swiper = (swiperElRef.value as any).swiper as
                    | Swiper
                    | undefined;

                  if (!swiper) return;

                  swiper.slideTo(2);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-auto md:h-7"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill="currentColor"
                    d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10S4.477 0 10 0m0 1.395a8.605 8.605 0 1 0 0 17.21a8.605 8.605 0 0 0 0-17.21m-.93 4.186c.385 0 .697.313.697.698v4.884h4.884a.698.698 0 0 1 0 1.395H9.07a.698.698 0 0 1-.698-.698V6.28c0-.386.312-.699.698-.699"
                  />
                </svg>
              </TabButton>
            </div>

            <hr class="absolute left-0 top-1/2 -z-[1] h-px w-full border-0 bg-[#ebe0dc]" />
          </div>

          <div class="flex-1 bg-[#fafafa]  ">
            <div ref={swiperElRef} id="filter-slider" class="swiper">
              <div class="swiper-wrapper">
                <div class="swiper-slide">
                  <ByTagsCategories
                    newTagInputRef={newTagInputRef}
                    localFilterTags={localFilterTags}
                    addTag$={addTag$}
                    categories={categories}
                    localFilterCategories={localFilterCategories}
                  />
                </div>
                <div class="swiper-slide">
                  <ByLocation
                    showSuggestions={showSuggestions}
                    searchLocation={searchLocation}
                    isLoading={isLoading}
                    suggestions={suggestions}
                    localFilterDistance={localFilterDistance}
                    localLocationName={localLocationName}
                    canSearchLocation={canSearchLocation}
                    handlePlaceSelect$={handlePlaceSelect$}
                    handleSearch$={fetchSuggestions$}
                  />
                </div>
                <div class="swiper-slide">
                  <div class="h-full  px-5 py-6">
                    <div class="mx-auto h-full space-y-6 lg:w-4/5">
                      <div>
                        <p class="mb-2 text-center text-xl font-bold">
                          Quando?
                        </p>
                        <p class="text-center">
                          Selecione a partir de qual data voce deseja ver
                          eventos
                        </p>
                      </div>
                      <Calendar
                        initialDay={localMaxDate}
                        handleChange={$((date) => {
                          localMaxDate.value = date;
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center gap-16 bg-white px-5 py-3">
            <button
              type="button"
              onClick$={handleClose$}
              class="rounded-lg border border-[#ff7b0d] px-5 py-1 font-semibold text-[#ff7b0d]"
            >
              Fetchar
            </button>
            <button
              type="button"
              onClick$={applyFilters}
              class="rounded-lg bg-[#ff7b0d] px-5 py-1 font-semibold text-white"
            >
              Ver Eventos
            </button>
          </div>
        </div>
      </Modal>

      <RelevanceSortModal
        showModal={showRelevanceFilterModal}
        filterOptions={relevanceFilterOptions}
        altFilter$={$(() => {
          showFilterModal.value = true;
        })}
        applyFilters$={filterByRelevance$}
      />
    </>
  );
});
