import { component$, useTask$, Slot, useSignal, $ } from "@builder.io/qwik";
import type { Signal, QRL, PropsOf } from "@builder.io/qwik";
import { isServer, isBrowser } from "@builder.io/qwik/build";
interface ModalProps extends Omit<PropsOf<"dialog">, "open"> {
  open: Signal<boolean>;
  onOpen$?: QRL<() => void>;
  onClose$?: QRL<() => void>;
}

export const Modal = component$(
  ({ onOpen$, onClose$, class: propsClass, open: opened }: ModalProps) => {
    const ref = useSignal<HTMLDialogElement>();

    const closing = useSignal(false);

    useTask$(() => {
      if (isServer) return;

      const handler = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          opened.value = false;
        }
      };

      ref.value?.addEventListener("keydown", handler);

      return () => ref.value?.removeEventListener("keydown", handler);
    });

    useTask$(function ({ track }) {
      track(() => opened.value);
      if (isBrowser) {
        if (!ref.value) return;
        console.log(opened.value);
        if (opened.value) {
          ref.value.showModal();
          if (onOpen$) onOpen$();
        } else {
          closing.value = true;
          if (onClose$) onClose$();
          setTimeout(() => {
            closing.value = false;
            ref.value?.close();
          }, 300);
        }
      }
    });

    const onClick = $((event: PointerEvent, element: HTMLDialogElement) => {
      if (event.target === element) opened.value = false;
    });

    return (
      <dialog
        class={[
          propsClass,
          closing.value && "closing",
          opened.value ? "opened" : "closed",
        ]}
        ref={ref}
        onClick$={onClick}
      >
        <Slot />
      </dialog>
    );
  },
);
