/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { QRL, Signal } from "@builder.io/qwik";
import { component$, useSignal, useTask$ } from "@builder.io/qwik";
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

type FilterOption = { title: string; key: string };
type Props = {
  showModal: Signal<boolean>;
  filterOptions: Signal<FilterOption[]>;
  altFilter: QRL<() => void>;
};

export default component$<Props>(({ showModal, filterOptions, altFilter }) => {
  useTask$(
    ({ cleanup, track }) => {
      track(() => filterOptions.value);
      cleanup(
        monitorForElements({
          onDrop: ({ location, source }) => {
            const [destination] = location.current.dropTargets;

            if (!destination) return;
            const destKey = destination.data.key as string; // matches what is returned by getData in dropTargetForElements

            const sourcekey = source.data.key as string;

            const sourceIndex = filterOptions.value.findIndex(
              (option) => option.key === sourcekey,
            );

            const destIndex = filterOptions.value.findIndex(
              (option) => option.key === destKey,
            );

            if (sourceIndex < 0 || destIndex < 0) return;

            const closestEdgeOfTarget = extractClosestEdge(destination.data);

            filterOptions.value = reorderWithEdge({
              list: filterOptions.value,
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
      class="[scrollbar-width:none] backdrop:bg-black/50 lg:w-[30%] lg:rounded-2xl"
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
          <div class="flex items-center gap-2">
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
              <p>Arraste para cima o que e mais importante para voce</p>
            </div>
          </div>

          <div class="space-y-3 px-5">
            {filterOptions.value.map((opt, index) => (
              <FilterListItem option={opt} index={index + 1} key={index} />
            ))}
            <div class="flex items-center gap-2">
              <div class="flex w-8 items-center  justify-center self-stretch rounded bg-[#a7a7a7] text-xl font-semibold text-white">
                {filterOptions.value.length + 1}
              </div>
              <div class="flex flex-1 items-center gap-2 rounded border border-dashed border-[#a7a7a7] px-2 py-3 font-semibold text-[#ff7b0d]">
                <svg
                  class="h-6 w-auto shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill="#a7a7a7"
                    fill-rule="evenodd"
                    d="M7.375 3.67c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .646.56 1.17 1.25 1.17s1.25-.524 1.25-1.17m0 8.66c0-.646-.56-1.17-1.25-1.17s-1.25.524-1.25 1.17c0 .645.56 1.17 1.25 1.17s1.25-.525 1.25-1.17m-1.25-5.5c.69 0 1.25.525 1.25 1.17c0 .645-.56 1.17-1.25 1.17S4.875 8.645 4.875 8c0-.645.56-1.17 1.25-1.17m5-3.16c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .646.56 1.17 1.25 1.17s1.25-.524 1.25-1.17m-1.25 7.49c.69 0 1.25.524 1.25 1.17c0 .645-.56 1.17-1.25 1.17s-1.25-.525-1.25-1.17c0-.646.56-1.17 1.25-1.17M11.125 8c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .645.56 1.17 1.25 1.17s1.25-.525 1.25-1.17"
                  />
                </svg>

                <span class="text-[#a7a7a7]">#</span>

                <p>Minhas preferencias</p>

                <button
                  type="button"
                  onClick$={() => {
                    showModal.value = false;
                    altFilter();
                  }}
                  class="ml-auto rounded-lg bg-[#ff7b0d] px-5 py-1 font-semibold text-white shadow"
                >
                  Configurar
                </button>
              </div>
            </div>
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
            onClick$={() => {}}
            class="rounded-lg bg-[#ff7b0d] px-5 py-1 font-semibold text-white"
          >
            Ver Eventos
          </button>
        </div>
      </div>
    </Modal>
  );
});

type FilterListItemProps = {
  option: FilterOption;
  index: number;
};

const FilterListItem = component$<FilterListItemProps>(
  ({ index, option: { key, title } }) => {
    const optRef = useSignal<HTMLDivElement>();

    const isDragging = useSignal(false);

    const isDraggingOver = useSignal(false);

    useTask$(
      ({ track, cleanup }) => {
        const el = track(() => optRef.value);

        if (!el) return;

        cleanup(
          combine(
            draggable({
              element: el,
              getInitialData: () => ({
                key,
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
                  { key },
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
          ),
        );
      },
      { eagerness: "idle" },
    );

    return (
      <div
        class={[
          "flex items-center gap-2 hover:cursor-grab",
          isDragging.value && "opacity-40",
        ]}
        ref={optRef}
      >
        <div class="flex w-8 items-center  justify-center self-stretch rounded bg-[#ff7400] text-xl font-semibold text-white">
          {index}
        </div>
        <div class="flex flex-1 items-center gap-2 rounded border border-[#ff7b0d] px-2 py-3 font-semibold text-[#ff7b0d] shadow-md">
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

          {key === "recent" && <CalenderCheckIcon />}
          {key === "nearest" && <LocationDotIcon />}

          {title}
        </div>
      </div>
    );
  },
);
