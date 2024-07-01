/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { QRL, Signal } from "@builder.io/qwik";
import { Slot, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { Modal } from "../common/Modal";

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import CalenderCheckIcon from "~/media/calendar-check.svg?jsx";
import LocationDotIcon from "~/media/location-dot.svg?jsx";
import type { RelevanceFilterItem } from "~/types";

type Props = {
  showModal: Signal<boolean>;
  filterOptions: Signal<RelevanceFilterItem[]>;
  altFilter$: QRL<() => void>;
  applyFilters$: QRL<() => void>;
};

export default component$<Props>(
  ({ showModal, filterOptions, altFilter$, applyFilters$ }) => {
    useTask$(
      ({ cleanup, track }) => {
        const options = track(() => filterOptions.value);

        cleanup(
          monitorForElements({
            onDrop: ({ location, source }) => {
              const [destination] = location.current.dropTargets;

              if (!destination) return;
              const destKey = destination.data.key as string; // matches what is returned by getData in dropTargetForElements

              const sourcekey = source.data.key as string;

              const sourceIndex = options.findIndex(
                (option) => option.key === sourcekey,
              );

              const destIndex = options.findIndex(
                (option) => option.key === destKey,
              );

              if (sourceIndex < 0 || destIndex < 0) return;

              const closestEdgeOfTarget = extractClosestEdge(destination.data);

              filterOptions.value = reorderWithEdge({
                list: options,
                startIndex: sourceIndex,
                indexOfTarget: destIndex,
                closestEdgeOfTarget,
                axis: "vertical",
              });
            },
          }),
        );
      },
      { eagerness: "visible" },
    );

    return (
      <Modal
        open={showModal}
        onClose$={() => {
          showModal.value = false;
        }}
        class="w-full [scrollbar-width:none]  backdrop:bg-black/50 max-lg:h-full max-lg:!max-h-[100%] max-lg:!max-w-[100%]   lg:w-3/4 lg:rounded-2xl xl:w-[30%]"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-center justify-between bg-black px-5 py-3 text-white">
            <p class="text-xl font-semibold">Relevancia</p>
            <button
              type="button"
              onClick$={() => {
                showModal.value = false;
              }}
            >
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

          <div class="flex-1 space-y-10 bg-[#fafafa] px-5 py-6">
            <div class="flex items-center gap-3  md:gap-2">
              <svg
                class="h-8 w-auto shrink-0 stroke-[1.2px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="4.5 3.5 18 17"
              >
                <g fill="none" stroke="currentColor">
                  <path stroke-linecap="round" d="M5 8h7m-7 4h7m-7 4h7"></path>
                  <path d="m19 20l3-3m-3 3l-3-3m3 3V4m0 0l-3 3m3-3l3 3"></path>
                </g>
              </svg>
              <div>
                <p class="text-xl font-bold">Ordene por importancia</p>
                <p class="text-sm md:text-base">
                  Arraste para cima o que e mais importante para voce
                </p>
              </div>
            </div>

            <div class="space-y-3 md:px-5">
              {filterOptions.value.map((opt, index) => (
                <FilterListItem option={opt} index={index + 1} key={index}>
                  {opt.key === "preferencias" && !opt.isActive && (
                    <button
                      type="button"
                      onClick$={() => {
                        showModal.value = false;
                        altFilter$();
                      }}
                      class="ml-auto rounded-lg bg-[#ff7b0d] p-2 font-semibold text-white shadow md:px-5 md:py-1"
                    >
                      <svg
                        class="size-5 md:hidden"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          fill-rule="evenodd"
                          d="M14.279 2.152C13.909 2 13.439 2 12.5 2s-1.408 0-1.779.152a2.008 2.008 0 0 0-1.09 1.083c-.094.223-.13.484-.145.863a1.615 1.615 0 0 1-.796 1.353a1.64 1.64 0 0 1-1.579.008c-.338-.178-.583-.276-.825-.308a2.026 2.026 0 0 0-1.49.396c-.318.242-.553.646-1.022 1.453c-.47.807-.704 1.21-.757 1.605c-.07.526.074 1.058.4 1.479c.148.192.357.353.68.555c.477.297.783.803.783 1.361c0 .558-.306 1.064-.782 1.36c-.324.203-.533.364-.682.556a1.99 1.99 0 0 0-.399 1.479c.053.394.287.798.757 1.605c.47.807.704 1.21 1.022 1.453c.424.323.96.465 1.49.396c.242-.032.487-.13.825-.308a1.64 1.64 0 0 1 1.58.008c.486.28.774.795.795 1.353c.015.38.051.64.145.863c.204.49.596.88 1.09 1.083c.37.152.84.152 1.779.152s1.409 0 1.779-.152a2.008 2.008 0 0 0 1.09-1.083c.094-.223.13-.483.145-.863c.02-.558.309-1.074.796-1.353a1.64 1.64 0 0 1 1.579-.008c.338.178.583.276.825.308c.53.07 1.066-.073 1.49-.396c.318-.242.553-.646 1.022-1.453c.47-.807.704-1.21.757-1.605a1.99 1.99 0 0 0-.4-1.479c-.148-.192-.357-.353-.68-.555c-.477-.297-.783-.803-.783-1.361c0-.558.306-1.064.782-1.36c.324-.203.533-.364.682-.556a1.99 1.99 0 0 0 .399-1.479c-.053-.394-.287-.798-.757-1.605c-.47-.807-.704-1.21-1.022-1.453a2.026 2.026 0 0 0-1.49-.396c-.242.032-.487.13-.825.308a1.64 1.64 0 0 1-1.58-.008a1.615 1.615 0 0 1-.795-1.353c-.015-.38-.051-.64-.145-.863a2.007 2.007 0 0 0-1.09-1.083M12.5 15c1.67 0 3.023-1.343 3.023-3S14.169 9 12.5 9c-1.67 0-3.023 1.343-3.023 3s1.354 3 3.023 3"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span class="hidden md:block">Configurar</span>
                    </button>
                  )}
                </FilterListItem>
              ))}
            </div>
          </div>

          <div class="flex items-center justify-center gap-16 bg-white px-5 py-3">
            <button
              type="button"
              onClick$={() => {
                showModal.value = false;
              }}
              class="rounded-lg border border-[#ff7b0d] px-5 py-1 font-semibold text-[#ff7b0d]"
            >
              Fetchar
            </button>
            <button
              type="button"
              onClick$={applyFilters$}
              class="rounded-lg bg-[#ff7b0d] px-5 py-1 font-semibold text-white"
            >
              Ver Eventos
            </button>
          </div>
        </div>
      </Modal>
    );
  },
);

type FilterListItemProps = {
  option: RelevanceFilterItem;
  index: number;
};

const FilterListItem = component$<FilterListItemProps>((props) => {
  const optRef = useSignal<HTMLDivElement>();

  const isDragging = useSignal(false);

  const isDraggingOver = useSignal(false);

  useTask$(
    ({ track, cleanup }) => {
      const el = track(() => optRef.value);

      const isActive = track(() => props.option.isActive);

      if (!el) return;

      cleanup(
        isActive
          ? combine(
              draggable({
                element: el,
                getInitialData: () => ({
                  key: props.option.key,
                }),
                onDragStart: () => {
                  isDragging.value = true;
                },
                onDrop: () => {
                  isDragging.value = false;
                },
              }),
              dropTargetForElements({
                element: el,
                canDrop({ source }) {
                  if (source.element === el) {
                    return false;
                  }

                  return true;
                },
                getData: ({ input }) => {
                  return attachClosestEdge(
                    { key: props.option.key },
                    {
                      element: el,
                      input,
                      allowedEdges: ["top", "bottom"],
                    },
                  );
                },
                getIsSticky: () => true,
                onDragEnter: () => {
                  isDraggingOver.value = true;
                },
                onDragLeave: () => {
                  isDraggingOver.value = false;
                },
                onDrop: () => {
                  isDraggingOver.value = false;
                },
              }),
            )
          : () => {},
      );
    },
    { eagerness: "visible" },
  );

  return (
    <div
      class={[
        "flex items-center gap-2 hover:cursor-grab",
        isDragging.value && "opacity-40",
      ]}
      ref={optRef}
    >
      <div
        class={[
          "flex w-8 items-center  justify-center self-stretch rounded text-xl font-semibold text-white",
          props.option.isActive ? "bg-[#ff7400] " : "bg-[#a7a7a7]",
        ]}
      >
        {props.index}
      </div>
      <div
        class={[
          "flex flex-1 items-center gap-2 rounded border    px-2 py-3 font-semibold  text-[#ff7b0d] shadow-md",
          props.option.isActive
            ? "border-[#ff7b0d] "
            : "border-dashed border-[#a7a7a7]",
        ]}
      >
        <button type="button" class="">
          <svg
            class="h-6 w-auto"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
          >
            <path
              fill="#222122"
              fill-rule="evenodd"
              d="M7.375 3.67c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .646.56 1.17 1.25 1.17s1.25-.524 1.25-1.17m0 8.66c0-.646-.56-1.17-1.25-1.17s-1.25.524-1.25 1.17c0 .645.56 1.17 1.25 1.17s1.25-.525 1.25-1.17m-1.25-5.5c.69 0 1.25.525 1.25 1.17c0 .645-.56 1.17-1.25 1.17S4.875 8.645 4.875 8c0-.645.56-1.17 1.25-1.17m5-3.16c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .646.56 1.17 1.25 1.17s1.25-.524 1.25-1.17m-1.25 7.49c.69 0 1.25.524 1.25 1.17c0 .645-.56 1.17-1.25 1.17s-1.25-.525-1.25-1.17c0-.646.56-1.17 1.25-1.17M11.125 8c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .645.56 1.17 1.25 1.17s1.25-.525 1.25-1.17"
            />
          </svg>
        </button>

        {props.option.key === "recent" && <CalenderCheckIcon />}
        {props.option.key === "nearest" && <LocationDotIcon />}
        {props.option.key === "preferencias" && (
          <span class="text-[#a7a7a7]">#</span>
        )}

        {props.option.title}

        <Slot />
      </div>
    </div>
  );
});
