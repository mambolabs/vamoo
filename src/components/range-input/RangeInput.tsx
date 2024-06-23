import { type QRL, component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./range-input.css?inline";
type RangeInputProps = {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  handleChange?: QRL<(value: number) => void>;
};
export default component$<RangeInputProps>(
  ({ min = 0, max = 100, step = 1, value = 0, handleChange }) => {
    useStylesScoped$(styles);

    return (
      <input
        type="range"
        class="w-full bg-[#c6c6c6] accent-[#ff7b0d]"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput$={({ target }) => {
          const input = target as HTMLInputElement;

          const progress = (input.valueAsNumber / max) * 100;

          input.style.background = `linear-gradient(to right, #ff7400 0%, #ff7400 ${progress}%, #c6c6c6 ${progress}%, #c6c6c6 100%)`;
          handleChange?.(input.valueAsNumber);
        }}
      />
    );
  },
);
