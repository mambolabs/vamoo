import { $, component$, useComputed$, useTask$ } from "@builder.io/qwik";
import Avatar from "~/media/user.png?jsx";
import type { TEvent } from "~/types";
import { isServer } from "@builder.io/qwik/build";

import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import { Modal, type ModalProps } from "../common/Modal";

export default component$<ModalProps & { event: TEvent }>(
  ({ event, open, ...props }) => {
    const formatEventDates = $((date: Date) => {
      if (isNaN(date.getTime())) {
        return "";
      }

      const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "long",
      });

      const timeFormatter = new Intl.DateTimeFormat("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
    });

    const eventDates = useComputed$(() => {
      return [
        { title: "Incío", date: formatEventDates(new Date(event.startsOn)) },
        { title: "Término", date: formatEventDates(new Date(event.endsOn)) },
      ];
    });

    return (
      <Modal
        {...props}
        open={open}
        class="w-full [scrollbar-width:none] backdrop:bg-black/50 max-lg:h-full max-lg:!max-h-[100%] max-lg:!max-w-[100%]  lg:w-3/4 lg:rounded-2xl xl:h-4/5 xl:w-[45%]"
      >
        <div class="flex items-center justify-between bg-black px-5 py-3 text-white">
          <button
            type="button"
            onClick$={() => {
              open.value = false;
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-6"
              viewBox="0 0 32 32"
            >
              <path
                fill="currentColor"
                d="M29 16c0 .69-.56 1.25-1.25 1.25H7.213l7.432 7.628a1.25 1.25 0 1 1-1.79 1.744l-9.497-9.747a1.246 1.246 0 0 1 0-1.75l9.497-9.747a1.25 1.25 0 0 1 1.79 1.744L7.213 14.75H27.75c.69 0 1.25.56 1.25 1.25"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick$={() => {
              open.value = false;
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

        <div>
          <div class="bg-black">
            <ImageSlider media={event.media} />
          </div>

          <div class="p-5">
            <div class="flex items-center gap-5">
              <div class="flex items-center gap-2">
                <div class="rounded-full bg-[#e0e0e0] p-4">
                  <Avatar class="size-16" />
                </div>

                <div>
                  <p class="text-xl/none font-bold">
                    {event.instagramUsername}
                  </p>
                  <p class="font-light text-[#444444]">
                    Membro desde {new Date(event.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
              <div>
                <div class="hidden items-center gap-3 lg:flex">
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

            <div class="mt-5">
              <p class="text-xl/none font-bold">{event.name}</p>
              <div
                class="mt-5 text-base/normal text-[#a3a09e]"
                dangerouslySetInnerHTML={event.description
                  .split("\n")
                  .join("<br/>")}
              ></div>
            </div>

            <div class="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-10">
              <div class="contents lg:block lg:space-y-5">
                <div class="max-lg:order-1">
                  <p class="mb-2 text-lg font-bold 2xl:text-xl">
                    Categorias do Evento
                  </p>
                  <div class="flex flex-wrap gap-2">
                    {event.categories.map((category) => (
                      <span
                        key={category}
                        class="rounded-full border bg-black px-2.5 py-1 text-sm font-semibold text-white"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div class="max-lg:order-4">
                  <p class="mb-2 text-lg font-semibold text-[#ff7400] 2xl:text-xl">
                    Quando será este rolê?
                  </p>

                  <div class="grid grid-cols-2 gap-3">
                    {eventDates.value.map((item, index) => (
                      <div key={index} class="rounded-lg border p-3">
                        <div class="flex items-center gap-2 text-[#ff7400]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="size-4"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6zm7 6q-.425 0-.712-.288T11 13t.288-.712T12 12t.713.288T13 13t-.288.713T12 14m-4 0q-.425 0-.712-.288T7 13t.288-.712T8 12t.713.288T9 13t-.288.713T8 14m8 0q-.425 0-.712-.288T15 13t.288-.712T16 12t.713.288T17 13t-.288.713T16 14m-4 4q-.425 0-.712-.288T11 17t.288-.712T12 16t.713.288T13 17t-.288.713T12 18m-4 0q-.425 0-.712-.288T7 17t.288-.712T8 16t.713.288T9 17t-.288.713T8 18m8 0q-.425 0-.712-.288T15 17t.288-.712T16 16t.713.288T17 17t-.288.713T16 18"
                            />
                          </svg>
                          <p class="">{item.title}</p>
                        </div>
                        <p class="text-lg font-bold   2xl:text-2xl">
                          {item.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div class="max-lg:order-6">
                  <p class="mb-2 text-lg font-semibold text-[#ff7400] 2xl:text-xl">
                    Dúvidas sobre este evento?
                  </p>
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="size-7"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"
                      />
                    </svg>
                    <p>{event.phoneNumber}</p>
                  </div>
                </div>
              </div>

              <div class="contents  lg:block lg:space-y-5">
                <div class="max-lg:order-2">
                  <p class="mb-2 text-lg font-bold 2xl:text-xl">
                    Tags do Evento
                  </p>

                  <div class="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        class="rounded-full border px-2.5 py-1 text-sm  "
                      >
                        <strong>#</strong>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div class="order-3 flex items-center gap-3 lg:hidden">
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

                <div class="max-lg:order-5">
                  <p class="text-lg font-semibold text-[#ff7400] 2xl:text-xl">
                    Onde será este rolê?
                  </p>
                  <p class="text-[#75716e]">{event.placeName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  },
);

const ImageSlider = component$<{ media: TEvent["media"] }>((props) => {
  useTask$(
    ({ cleanup }) => {
      if (isServer) {
        return;
      }

      const swiperInstance = new Swiper("#images-slider", {
        modules: [Navigation, Pagination],
        pagination: {
          el: ".swiper-pagination",
          enabled: true,
        },
        navigation: {
          enabled: false,
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
          disabledClass: "swiper-button-disabled !opacity-0",
        },
        slidesPerView: 1,
        breakpoints: {
          1024: {
            navigation: {
              enabled: true,
            },
          },
        },
      });

      cleanup(() => {
        swiperInstance.destroy();
      });
    },
    { eagerness: "visible" },
  );

  return (
    <div
      id="images-slider"
      class="swiper  [--swiper-navigation-color:#ff7400] [--swiper-navigation-sides-offset:30px] [--swiper-navigation-size:35px] [--swiper-pagination-bullet-inactive-color:#f5f5f5] [--swiper-pagination-bullet-inactive-opacity:1] [--swiper-pagination-bullet-size:12px] [--swiper-pagination-color:#ff7400]"
    >
      <div class="swiper-wrapper">
        {props.media.map((image) => (
          <div class="swiper-slide" key={image.id}>
            <img
              class="mx-auto w-1/2 "
              height={500}
              width={500}
              src={image.url}
              loading="lazy"
              alt=""
            />
          </div>
        ))}
      </div>

      <div class="swiper-pagination"></div>

      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  );
});
