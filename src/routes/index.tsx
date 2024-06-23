import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import EventModal from "~/components/EventModal";
import Filter from "~/components/Filter";
import { useFilter } from "~/hooks/useFilter";
import Avatar from "~/media/user.png?jsx";
import type { TEvent } from "~/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const useEvents = routeLoader$(async () => {
  const response = await fetch("https://api.vamoo.la/v1/events");

  const data = await response.json();

  return data.details.results as TEvent[];
});

function viaDate(dateString: string) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  return `${date.getDate()} - ${new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "UTC",
  })
    .format(date)
    .toLowerCase()}`;
}

export default component$(() => {
  const eventsRef = useSignal<HTMLDivElement>();

  const showModal = useSignal(false);

  const initialEvents = useEvents();

  const isLoading = useSignal(false);

  const events = useSignal<TEvent[]>(initialEvents.value);

  const previewEvent = useSignal(
    events.value.length > 0 ? events.value[0] : null,
  );

  // const categories = useComputed$(() => [
  //   ...new Set(events.value.flatMap((event) => event.categories)),
  // ]);

  const { categories, filteredEvents, filterCategories, filterTags } =
    useFilter(events);

  const loadEvents = $(async () => {
    const url = new URL("https://api.vamoo.la/v1/events");

    if (events.value.length) {
      const lastEvent = events.value[events.value.length - 1];

      for (const value of lastEvent._esMeta.sort) {
        url.searchParams.append("search_after[]", value.toString());
      }
    }

    const response = await fetch(url);

    const data = await response.json();

    return data.details.results as TEvent[];
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(() => eventsRef.value);

    const observeLastChild = () => {
      if (!eventsRef.value) return;

      const lastChild = eventsRef.value.lastElementChild;

      if (lastChild) {
        observer.observe(lastChild);
      }
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          try {
            isLoading.value = true;
            const newEvents = await loadEvents();

            if (!newEvents.length) {
              isLoading.value = false;

              return;
            }

            events.value = [...events.value, ...newEvents];

            observer.unobserve(entry.target);
            observeLastChild();
          } catch (err) {
            console.log(err);
          } finally {
            isLoading.value = false;
          }
        }
      });
    });

    observeLastChild();
    cleanup(() => {
      observer.disconnect();
    });
  });

  return (
    <div class="mx-auto grid grid-cols-1 gap-10 overflow-hidden md:h-screen md:grid-cols-[16%,1fr,16%] lg:px-5 xl:max-w-[1340px] 2xl:px-0">
      <aside class="">
        <p class="text-2xl font-bold">Categorias</p>
        {categories.value.map((category, index) => (
          <p key={index}>{category}</p>
        ))}
      </aside>
      <main class="pt-2 md:h-full md:overflow-hidden">
        <Filter
          categories={categories}
          filterTags={filterTags}
          filterCategories={filterCategories}
        />

        <div class="pb-20 [scrollbar-width:none] md:h-full md:overflow-y-auto md:px-3">
          <p class="mb-5 text-xl">
            <strong class="text-[#ff7400]">{events.value.length}</strong>{" "}
            Eventos encontrados
          </p>

          <div ref={eventsRef} class="space-y-10 ">
            {events.value.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                class="rounded-2xl border shadow-lg"
                onClick$={() => {
                  previewEvent.value = event;
                  showModal.value = true;
                }}
              >
                <div class="flex items-center gap-2 p-5">
                  <div class="rounded-full bg-[#e0e0e0] p-2">
                    <Avatar class="size-8" />
                  </div>

                  <div>
                    <p class="text-xl/none font-bold">{event.name}</p>
                    <p class="font-light text-[#444444]">
                      {event.instagramUsername}
                    </p>
                  </div>
                </div>
                <div class="relative rounded-2xl bg-black">
                  <div class="absolute left-5 top-5 flex items-center gap-3">
                    <span class="rounded-full bg-[#0c9d0c] px-2.5 py-1 text-sm font-semibold text-white">
                      Qua, {viaDate(event.startsOn)}
                    </span>
                    <span class="rounded-full bg-[#ff7400] px-2.5 py-1 text-sm font-semibold text-white">
                      {event.placeName}
                    </span>
                  </div>
                  <img
                    class="mx-auto w-3/4 "
                    height={500}
                    width={500}
                    src={event.media[0].url}
                    loading="lazy"
                    alt=""
                  />
                </div>
                <div class="space-y-5 p-5">
                  <div class="flex flex-wrap gap-2">
                    {event.categories.map((category) => (
                      <span
                        key={category}
                        class="rounded-full border bg-black px-2.5 py-1 text-sm font-semibold text-white"
                      >
                        {category}
                      </span>
                    ))}

                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        class="rounded-full border px-2.5 py-1 text-sm text-[#6b6b6b]"
                      >
                        <strong>#</strong>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="rounded-lg bg-[#3d4046] p-2 text-[#ff7400] shadow-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="pointer-events-none size-6"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M18 22q-1.25 0-2.125-.875T15 19q0-.175.025-.363t.075-.337l-7.05-4.1q-.425.375-.95.588T6 15q-1.25 0-2.125-.875T3 12t.875-2.125T6 9q.575 0 1.1.213t.95.587l7.05-4.1q-.05-.15-.075-.337T15 5q0-1.25.875-2.125T18 2t2.125.875T21 5t-.875 2.125T18 8q-.575 0-1.1-.212t-.95-.588L8.9 11.3q.05.15.075.338T9 12t-.025.363t-.075.337l7.05 4.1q.425-.375.95-.587T18 16q1.25 0 2.125.875T21 19t-.875 2.125T18 22"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="rounded-lg bg-[#3d4046] p-2 text-[#ff7400] shadow-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="pointer-events-none size-6"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          stroke-miterlimit="10"
                          stroke-width="32"
                          d="M366.05 146a46.7 46.7 0 0 1-2.42-63.42a3.87 3.87 0 0 0-.22-5.26l-44.13-44.18a3.89 3.89 0 0 0-5.5 0l-70.34 70.34a23.6 23.6 0 0 0-5.71 9.24a23.66 23.66 0 0 1-14.95 15a23.7 23.7 0 0 0-9.25 5.71L33.14 313.78a3.89 3.89 0 0 0 0 5.5l44.13 44.13a3.87 3.87 0 0 0 5.26.22a46.69 46.69 0 0 1 65.84 65.84a3.87 3.87 0 0 0 .22 5.26l44.13 44.13a3.89 3.89 0 0 0 5.5 0l180.4-180.39a23.7 23.7 0 0 0 5.71-9.25a23.66 23.66 0 0 1 14.95-15a23.6 23.6 0 0 0 9.24-5.71l70.34-70.34a3.89 3.89 0 0 0 0-5.5l-44.13-44.13a3.87 3.87 0 0 0-5.26-.22a46.7 46.7 0 0 1-63.42-2.32Z"
                        />
                        <path
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-miterlimit="10"
                          stroke-width="32"
                          d="m250.5 140.44l-16.51-16.51m60.53 60.53l-11.01-11m55.03 55.03l-11-11.01m60.53 60.53l-16.51-16.51"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isLoading.value && (
            <div class="flex items-center justify-center pb-20 pt-10">
              <div class="h-16 w-16 animate-[spin_2s_linear_infinite] rounded-full border-4 border-dashed border-gray-300"></div>
            </div>
          )}
        </div>
        {/* modal */}
        {previewEvent.value && (
          <EventModal
            show={showModal}
            onCloseModal$={() => {
              showModal.value = false;
            }}
            event={previewEvent.value}
          />
        )}
      </main>
      <aside class=""></aside>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Vamoo",
  meta: [
    {
      name: "description",
      content: "",
    },
  ],
};
