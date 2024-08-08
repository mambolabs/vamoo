import {
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import EventModal from "~/components/modals/EventModal";
import Filter from "~/components/filter";
import { useFilter } from "~/hooks/useFilter";

// ADS BANNERS
// RIGHT
import AdRightBanner1 from "~/media/banners/ads_banner_right_long.png?jsx";
import AdRightBanner2 from "~/media/banners/ads_banner_right.png?jsx";

// HEADER
import HeaderAD from "~/media/banners/ads_header.png?jsx";
import HeaderADMobile from "~/media/banners/banner_mobile.png?jsx";

import Logo from "~/media/logo.png?jsx";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { AD_STEP, EVENTS_ENDPOINT, categories } from "~/constants";
import { canShowAds, fetchEvents } from "~/utils";
import { useEventsContext } from "~/context/events-context";
import { useGeolocation } from "~/hooks/useGeolocation";
import EventCard from "~/components/EventCard";
import Adsense from "~/components/Adsense";

export const useEvents = routeLoader$(async () => {
  const url = new URL(EVENTS_ENDPOINT);

  url.searchParams.set("toDate", new Date().toISOString());
  url.searchParams.set("geoLocation", "0,0");
  url.searchParams.set("distance", "1km");

  return fetchEvents(url);
});

const sidebarLinks: { name: string; href: string }[] = [
  { name: "Terms of Service", href: "#terms-of-service" },
  { name: "Privacy Policy", href: "#privacy-policy" },
];

export default component$(() => {
  const evCtx = useEventsContext();

  useGeolocation();
  const { loadEvents } = useFilter();

  const triggerRef = useSignal<HTMLDivElement>();

  const showModal = useSignal(false);

  const initialEvents = useEvents();

  const isLoading = useSignal(false);

  const previewEvent = useSignal(
    evCtx.events.length > 0 ? evCtx.events[0] : null,
  );

  useTask$(() => {
    evCtx.events = initialEvents.value;
    previewEvent.value = initialEvents.value[0];
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track, cleanup }) => {
    const el = track(() => triggerRef.value);

    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            try {
              isLoading.value = true;
              const newEvents = await loadEvents();

              if (!newEvents.length) {
                isLoading.value = false;

                evCtx.events = [...evCtx.events, ...evCtx.events];

                return;
              }

              evCtx.events = [...evCtx.events, ...newEvents];
            } catch (err) {
              console.log(err);
            } finally {
              isLoading.value = false;
            }
          }
        });
      },
      {
        rootMargin: "50px",
      },
    );

    observer.observe(el);

    cleanup(() => observer.disconnect());
  });

  return (
    <div class="mx-auto grid grid-cols-1 gap-10 lg:h-screen lg:grid-cols-[16%,1fr,16%] lg:overflow-hidden lg:px-5 xl:max-w-[1340px] 2xl:px-0">
      <aside class="hidden space-y-5 pt-2 lg:block">
        <div>
          <Logo class="mx-auto h-7 w-auto" alt="VAMOO" />
        </div>
        <div>
          <p class="mb-2 text-2xl font-bold">Categorias</p>
          <div>
            {categories.map((category, index) => (
              <p key={index} class="font-semibold capitalize text-[#2d2d2d]">
                {category}
              </p>
            ))}
          </div>
        </div>
        <div class="">
          {sidebarLinks.map((link, index) => (
            <a
              key={link.name + index}
              href={link.href}
              class="block font-semibold capitalize text-[#2d2d2d]"
            >
              {link.name}
            </a>
          ))}
        </div>
      </aside>
      <main class="md:h-full md:overflow-hidden  ">
        <Adsense type="text-only-ad" class="h-full max-h-[130px] w-auto">
          <div>
            <HeaderAD class="hidden lg:block" />
            <HeaderADMobile class="lg:hidden" />
          </div>
        </Adsense>
        <Filter />

        <div class="pb-20 [scrollbar-width:none] md:h-full md:overflow-y-auto md:px-3">
          <p class="mb-5 text-xl max-lg:px-2.5">
            <strong class="text-[#ff7400]">{evCtx.events.length}</strong>{" "}
            Eventos encontrados
          </p>

          <div class="space-y-10">
            {evCtx.events.map((event, index) => (
              <>
                <EventCard
                  key={`${event.id}-${index}`}
                  event={event}
                  handleClick$={() => {
                    previewEvent.value = event;
                    showModal.value = true;
                  }}
                />

                {canShowAds(index) && (
                  <Adsense type="horizontal-feed-ad" key={`adsense-${index}`}>
                    <div class="grid place-items-center rounded-2xl border bg-gray-50 p-20 shadow-lg ">
                      <p class="text-2xl font-bold uppercase">
                        Ad Space {(index + 1) / AD_STEP}
                      </p>
                    </div>
                  </Adsense>
                )}
              </>
            ))}
          </div>
          <div ref={triggerRef} class="pb-20 pt-10">
            {isLoading.value ? (
              <div class="flex items-center justify-center ">
                <div class="h-16 w-16 animate-[spin_2s_linear_infinite] rounded-full border-4 border-dashed border-gray-300"></div>
              </div>
            ) : (
              <div class="">&nbsp;</div>
            )}
          </div>
        </div>

        {previewEvent.value && (
          <EventModal
            open={showModal}
            onClose$={() => {
              showModal.value = false;
            }}
            event={previewEvent.value}
          />
        )}
      </main>
      <aside class="grid grid-rows-2 gap-5 overflow-y-auto  [scrollbar-width:none] lg:pt-2">
        {[AdRightBanner1, AdRightBanner2].map((Banner, index) => (
          <div class="w-[200px] overflow-hidden rounded-2xl" key={index}>
            <Adsense type="vertical-ad" class="h-full w-full">
              <Banner />
            </Adsense>
          </div>
        ))}
      </aside>
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
