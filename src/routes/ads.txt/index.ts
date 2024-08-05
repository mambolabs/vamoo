import { type RequestHandler } from "@builder.io/qwik-city";
import { GOOGLE_ADSENSE_PUBLISHER_ID } from "~/constants";

export const onGet: RequestHandler = async ({ text }) => {
  text(
    200,
    `google.com, ${GOOGLE_ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`,
  );
};
