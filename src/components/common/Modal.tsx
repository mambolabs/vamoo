import { component$, useTask$, Slot, useSignal, useId } from "@builder.io/qwik";
import type { Signal, QRL, PropsOf } from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
export interface ModalProps
  extends Omit<PropsOf<"dialog">, "open" | "ref" | "id"> {
  open: Signal<boolean>;
  onOpen$?: QRL<() => void>;
}

export const Modal = component$(
  ({ onOpen$, open: opened, ...props }: ModalProps) => {
    const id = useId();

    const ref = useSignal<HTMLDialogElement>();

    useTask$(() => {
      if (isServer) return;

      const handler = (event: KeyboardEvent) => {
        console.log("handler:");

        if (event.key === "Escape") {
          event.preventDefault();
          ref.value?.close();
        }
      };

      ref.value?.addEventListener("keydown", handler);

      return () => ref.value?.removeEventListener("keydown", handler);
    });

    useTask$(function ({ track }) {
      const isOpen = track(() => opened.value);

      if (!ref.value) return;

      if (isOpen) {
        ref.value.showModal();
        if (onOpen$) onOpen$();
      } else {
        ref.value.close();
      }
    });

    return (
      <dialog {...props} id={id} ref={ref}>
        <Slot />
      </dialog>
    );
  },
);
