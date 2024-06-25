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
        if (event.key === "Escape") {
          event.preventDefault();
          ref.value?.close();
        }
      };

      ref.value?.addEventListener("keydown", handler);

      return () => ref.value?.removeEventListener("keydown", handler);
    });

    useTask$(({ track }) => {
      const isOpen = track(() => opened.value);

      const modal = track(() => ref.value);

      if (!modal) return;

      if (isOpen) {
        modal.showModal();
        if (onOpen$) onOpen$();
      } else {
        modal.close();
      }
    });

    return (
      <dialog {...props} id={id} ref={ref}>
        <Slot />
      </dialog>
    );
  },
);
