import { component$, useComputed$, useTask$ } from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
import {
  GOOGLE_ADSENSE_PUBLISHER_ID,
  HORIZONTAL_FEED_AD_SLOT,
  TEXT_ONLY_AD_SLOT,
  VERTICAL_AD_SLOT,
} from "~/constants";

type AdSenseProps = {
  type?: "horizontal-feed-ad" | "vertical-ad" | "text-only-ad";
  class?: string;
};

type AD = Record<string, unknown>;

/**
 *  replace with your own from Google AdSense
 */
const HorizontalFeedAd: AD = {
  "data-ad-slot": HORIZONTAL_FEED_AD_SLOT,
  "data-ad-format": "fluid",
  "data-ad-layout-key": "-f1+5r+5a-db+57",
};

/**
 *  replace with your own from Google AdSense
 */
const VerticalAd: AD = {
  "data-ad-slot": VERTICAL_AD_SLOT,
  "data-ad-format": "auto",
  "data-full-width-responsive": "true",
};

/**
 *  replace with your own from Google AdSense
 */
const TextOnlyAd: AD = {
  "data-ad-slot": TEXT_ONLY_AD_SLOT,
  "data-ad-format": "fluid",
  "data-layout-key": "-gw-3+1f-3d+2z",
};

export default component$<AdSenseProps>(
  ({ type = "horizontal-feed-ad", class: className }) => {
    useTask$(() => {
      if (isServer) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.log(err);
      }
    });

    const properties = useComputed$(() => {
      switch (type) {
        case "horizontal-feed-ad":
          return HorizontalFeedAd;
          break;
        case "vertical-ad":
          return VerticalAd;
          break;
        case "text-only-ad":
          return TextOnlyAd;
          break;
        default:
          return {};
      }
    });

    return (
      <div>
        {process.env.NODE_ENV === "production" ? (
          <ins
            class={[
              "adsbygoogle",
              type === "text-only-ad" && "h-[100px]",
              className,
            ]}
            style="display:block"
            {...properties.value}
            data-ad-client={GOOGLE_ADSENSE_PUBLISHER_ID}
          ></ins>
        ) : (
          <div class="grid h-[9rem] place-items-center bg-gray-200 ">
            <p class="text-2xl font-bold uppercase">AD Space</p>
          </div>
        )}
      </div>
    );
  },
);
