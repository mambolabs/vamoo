import type { QRL } from "@builder.io/qwik";
import { $, implicit$FirstArg, useSignal } from "@builder.io/qwik";

export const useDebouncerQrl = <T extends (...args: any[]) => void>(
  fn: QRL<T>,
  delay: number,
) => {
  const timeoutId = useSignal<number>();

  return $((...args: Parameters<T>) => {
    clearTimeout(timeoutId.value);
    timeoutId.value = Number(setTimeout(() => fn(...args), delay));
  });
};

export const useDebouncer$ = implicit$FirstArg(useDebouncerQrl);
