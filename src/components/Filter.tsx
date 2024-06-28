import type { PropsOf } from "@builder.io/qwik";
import {
  type Signal,
  component$,
  useSignal,
  Slot,
  $,
  useTask$,
  useComputed$,
} from "@builder.io/qwik";

import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import RangeInput from "./range-input/RangeInput";
import Calendar from "./Calendar";
import { Modal } from "./common/Modal";
import { isServer } from "@builder.io/qwik/build";
import {
  differenceInDays,
  format,
  formatRelative,
  startOfToday,
} from "date-fns";
import { pt } from "date-fns/locale";
import RelevanceSortModal from "./modals/RelevanceSortModal";
import type { RelevanceFilterItem } from "~/types";

type FilterProps = {
  categories: string[];
  filterTags: Signal<string[]>;
  filterCategories: Signal<string[]>;
  filterMaxDate: Signal<Date>;
};

const MAX_TAGS = 5;

const MAX_CATEGORIES = 3;

const today = startOfToday();

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

export default component$<FilterProps>(
  ({ categories, filterTags, filterCategories, filterMaxDate }) => {
    const swiperElRef = useSignal<HTMLDivElement>();

    const showFilterModal = useSignal(false);

    const showRelevanceFilterModal = useSignal(false);

    const newTagInputRef = useSignal<HTMLInputElement>();

    const filterView = useSignal<"time" | "location" | "tags">("tags");

    const localMaxDate = useSignal(filterMaxDate.value);

    const localFilterTags = useSignal(filterTags.value);

    const localFilterCategories = useSignal(filterCategories.value);

    const localFilterDistance = useSignal(1);

    const relevanceFilterOptions = useSignal<RelevanceFilterItem[]>(() =>
      uniqueKeys([
        { title: "Eventos mais recentes", key: "recent" },
        { title: "Eventos mais proximos", key: "nearest" },
      ]),
    );

    const handleClose = $(() => {
      localFilterCategories.value = filterCategories.value;
      localFilterTags.value = filterTags.value;
      showFilterModal.value = false;
    });

    const addTag = $(() => {
      if (!newTagInputRef.value) return;

      const tag = newTagInputRef.value.value;

      if (!tag) return;

      if (localFilterTags.value.length === MAX_TAGS) return;

      localFilterTags.value = [
        ...new Set([...localFilterTags.value, tag.trim()]),
      ];

      newTagInputRef.value.value = "";
    });

    const tagsViewFilters = $(() => {
      if (localFilterTags.value.length) {
        filterTags.value = localFilterTags.value;
      } else {
        filterTags.value = [];
      }

      if (localFilterCategories.value.length) {
        filterCategories.value = localFilterCategories.value;
      } else {
        filterCategories.value = [];
      }
    });

    const locationFilter = $(() => {
      console.log("locationFilter");
      /** TODO: */
    });

    const timeFilter = $(() => {
      filterMaxDate.value = localMaxDate.value;
    });

    const applyFilters = $(() => {
      switch (filterView.value) {
        case "tags":
          tagsViewFilters();
          break;
        case "location":
          locationFilter();
          break;
        case "time":
          timeFilter();
          break;
      }

      showFilterModal.value = false;
    });

    const displayDate = useComputed$(() => {
      let [rel] = formatRelative(filterMaxDate.value, today, {
        locale: pt,
      }).split(" ");

      if (differenceInDays(filterMaxDate.value, today) > 6) {
        rel = format(filterMaxDate.value, "eeee", { locale: pt });
      }

      const dateStr = format(filterMaxDate.value, "dd MMM", {
        locale: pt,
      });

      return `${rel}, ${dateStr}`;
    });

    const filterByRelevance = $(() => {
      showRelevanceFilterModal.value = false;

      console.log("filterByRelevance", relevanceFilterOptions.value);

      /** TODO: */
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

    return (
      <>
        <div class="flex  flex-col-reverse justify-center gap-1 rounded-2xl lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:border lg:px-3 lg:py-3">
          <div class="flex flex-wrap gap-2 max-lg:p-2.5">
            <button
              onClick$={() => {
                filterView.value = "time";
                showFilterModal.value = true;
              }}
              type="button"
              class="flex items-center gap-1 rounded-full border border-[#0c9d0c] px-4 py-1 text-sm font-semibold text-[#5b5b5b]"
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

            {filterCategories.value.map((category, index) => (
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

            {filterTags.value.map((tag, index) => (
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
          </div>
          <div class="flex items-center justify-between bg-black max-lg:p-2.5 lg:bg-white">
            <div class="flex items-center lg:hidden">
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
                    <path
                      stroke-linecap="round"
                      d="M5 8h7m-7 4h7m-7 4h7"
                    ></path>
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
              <button type="button" onClick$={handleClose}>
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
                <Button
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
                </Button>

                <Button
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
                </Button>

                <Button
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
                </Button>
              </div>

              <hr class="absolute left-0 top-1/2 -z-[1] h-px w-full border-0 bg-[#ebe0dc]" />
            </div>

            <div class="flex-1 bg-[#fafafa]  ">
              <div ref={swiperElRef} id="filter-slider" class="swiper">
                <div class="swiper-wrapper">
                  <div class="swiper-slide">
                    <div class="h-full  space-y-6 px-5 py-6">
                      <div class="space-y-2">
                        <p class="text-xl font-bold">Categorias</p>
                        <p>
                          Filtre ate <strong>3 categorias</strong>
                        </p>

                        <div class="flex flex-wrap gap-2">
                          {categories.map((category) => {
                            const isInFilter =
                              localFilterCategories.value.includes(category);

                            return (
                              <button
                                type="button"
                                disabled={
                                  localFilterCategories.value.length ===
                                  MAX_CATEGORIES
                                }
                                onClick$={() => {
                                  if (isInFilter) {
                                    localFilterCategories.value =
                                      localFilterCategories.value.filter(
                                        (cat) => cat !== category,
                                      );

                                    return;
                                  }

                                  localFilterCategories.value = [
                                    ...new Set([
                                      ...localFilterCategories.value,
                                      category,
                                    ]),
                                  ];
                                }}
                                key={category}
                              >
                                <span
                                  class={[
                                    "rounded-full border bg-black px-4 py-1 text-sm font-semibold text-white",
                                    isInFilter ? "opacity-100" : "opacity-40",
                                  ]}
                                >
                                  {category}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div class="space-y-2">
                        <p class="text-xl font-bold">Tags</p>
                        <p>
                          Filtre ate <strong>5 tags</strong>
                        </p>

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
                            ref={newTagInputRef}
                            type="text"
                            class="w-full rounded-lg border-2 border-[#9e9e9e] p-2 px-8 caret-[#ff7b0d] focus:text-[#9e9e9e]  focus:outline-[#ff7b0d]"
                            placeholder="Adicione uma tag"
                            name="tag"
                            onKeyDown$={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                            disabled={localFilterTags.value.length === MAX_TAGS}
                          />

                          <button
                            type="button"
                            onClick$={() => addTag()}
                            class="absolute right-0 top-1/2 flex aspect-square h-full -translate-y-1/2 items-center justify-center rounded-full text-[#9e9e9e] hover:bg-gray-200"
                          >
                            <svg
                              class="h-auto w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="m4 8.25l7.51 1l-7.5-3.22zm.01 9.72l7.5-3.22l-7.51 1z"
                                opacity="0.3"
                              />
                              <path
                                fill="currentColor"
                                d="M2.01 3L2 10l15 2l-15 2l.01 7L23 12zM4 8.25V6.03l7.51 3.22zm.01 9.72v-2.22l7.51-1z"
                              />
                            </svg>
                          </button>
                        </div>

                        <div class="flex flex-wrap gap-2">
                          {localFilterTags.value.map((tag) => (
                            <div
                              key={tag}
                              class="flex items-center gap-1.5 rounded-full border border-[#858585] px-3 py-1"
                            >
                              <span class="text-sm font-medium">
                                <strong>#</strong>
                                {tag}
                              </span>
                              <button
                                type="button"
                                onClick$={() => {
                                  localFilterTags.value =
                                    localFilterTags.value.filter(
                                      (t) => t !== tag,
                                    );
                                }}
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
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="swiper-slide">
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
                            type="text"
                            class="w-full rounded-lg border-2 border-[#9e9e9e] p-2 pl-8 caret-[#ff7b0d] focus:text-[#9e9e9e]  focus:outline-[#ff7b0d]"
                            name="location"
                            onKeyDown$={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>

                        <div class="flex flex-wrap gap-2"></div>
                      </div>
                      <div class="space-y-2">
                        <p class="text-xl font-bold">Distancia</p>
                        <p>
                          Selecione ate qual distancia voce esta disposto a ir
                        </p>

                        <div class="px-2">
                          <RangeInput
                            max={50}
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
                onClick$={handleClose}
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
          altFilter={$(() => {
            showFilterModal.value = true;
          })}
          applyFilters={filterByRelevance}
        />
      </>
    );
  },
);

type ButtonProps = PropsOf<"button"> & { isActive: boolean };

const Button = component$<ButtonProps>(({ isActive, ...props }) => {
  return (
    <button
      {...props}
      class={[
        "flex size-11 items-center justify-center rounded-full md:size-12 ",
        isActive
          ? "bg-black text-white"
          : "border border-[#ebe0dc] bg-white text-[#ff7b0d]",
      ]}
    >
      <Slot />
    </button>
  );
});
