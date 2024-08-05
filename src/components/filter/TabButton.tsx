import { component$, Slot, type PropsOf } from "@builder.io/qwik";

type ButtonProps = PropsOf<"button"> & { isActive: boolean };

export default component$<ButtonProps>(({ isActive, ...props }) => {
  return (
    <button
      {...props}
      class={[
        "flex size-11 items-center justify-center rounded-full md:size-12 ",
        isActive
          ? "bg-black text-white"
          : "border border-[#ebe0dc] bg-white text-[#ff7b0d]",
      ]}
    >
      <Slot />
    </button>
  );
});
