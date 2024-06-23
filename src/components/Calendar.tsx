import type { QRL } from "@builder.io/qwik";
import {
  $,
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameMonth,
  isToday,
  isBefore,
  parse,
  startOfToday,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import { pt } from "date-fns/locale";
const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

type CalendarStyles = {
  isSelected: boolean;
  isToday: boolean;
  isSameMonth: boolean;
  isBeforeToday: boolean;
};
const calendarStyles = ({
  isSelected,
  isToday,
  isSameMonth,
  isBeforeToday,
}: CalendarStyles) => [
  "mx-auto flex size-10 items-center justify-center rounded-full text-sm",
  isSelected && "font-semibold text-white bg-[#ff7400]",
  !isSelected && !isToday && isSameMonth && "text-center",
  !isSelected && !isToday && !isSameMonth && "text-[#c0c0c0]",
  isBeforeToday && "text-[#c0c0c0] cursor-not-allowed",
];

type CalendarProps = {
  handleChange?: QRL<(value: Date) => void>;
};

export default component$<CalendarProps>(({ handleChange }) => {
  const today = startOfToday();

  const selectedDay = useSignal(today);

  const currentMonth = useSignal(format(today, "MMM-yyyy"));

  const firstDayCurrentMonth = useComputed$(() =>
    parse(currentMonth.value, "MMM-yyyy", new Date()),
  );

  const days = useComputed$(() =>
    eachDayOfInterval({
      start: startOfWeek(firstDayCurrentMonth.value),
      end: endOfWeek(endOfMonth(firstDayCurrentMonth.value)),
    }),
  );

  const previousMonth = $(() => {
    const firstDayPrevMonth = add(firstDayCurrentMonth.value, { months: -1 });

    if (isBefore(firstDayPrevMonth, startOfMonth(today))) {
      return;
    }

    currentMonth.value = format(firstDayPrevMonth, "MMM-yyyy");
  });

  const nextMonth = $(() => {
    const firstDayNextMonth = add(firstDayCurrentMonth.value, { months: 1 });

    currentMonth.value = format(firstDayNextMonth, "MMM-yyyy");
  });

  useTask$(({ track }) => {
    track(() => selectedDay.value);
    handleChange?.(selectedDay.value);
  });

  return (
    <div class="calendar w-full">
      <div class="calendar-toolbar mb-3 flex items-center justify-between px-2 text-[#212121]">
        <button
          onClick$={previousMonth}
          class="flex h-8 w-8 min-w-[2rem] cursor-pointer items-center justify-center"
        >
          <svg
            class="h-6 w-auto"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m8.5 12.8l5.7 5.6c.4.4 1 .4 1.4 0c.4-.4.4-1 0-1.4l-4.9-5l4.9-5c.4-.4.4-1 0-1.4c-.2-.2-.4-.3-.7-.3c-.3 0-.5.1-.7.3l-5.7 5.6c-.4.5-.4 1.1 0 1.6c0-.1 0-.1 0 0"
            />
          </svg>
        </button>

        <p class="capitalize">
          {format(firstDayCurrentMonth.value, "MMMM yyyy", { locale: pt })}
        </p>

        <button
          onClick$={nextMonth}
          class="flex h-8 w-8 min-w-[2rem] cursor-pointer items-center justify-center"
        >
          <svg
            class="h-6 w-auto"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M15.54 11.29L9.88 5.64a1 1 0 0 0-1.42 0a1 1 0 0 0 0 1.41l4.95 5L8.46 17a1 1 0 0 0 0 1.41a1 1 0 0 0 .71.3a1 1 0 0 0 .71-.3l5.66-5.65a1 1 0 0 0 0-1.47"
            />
          </svg>
        </button>
      </div>

      <div class="w-full">
        <div class="grid grid-cols-7 gap-1 text-sm text-[#6a6a6a] [&>*]:py-2 [&>*]:text-center">
          <div data-en="Sun">Dom</div>
          <div data-en="Mon">Seg</div>
          <div data-en="Tue">Ter</div>
          <div data-en="Wed">Qua</div>
          <div data-en="Thu">Qui</div>
          <div data-en="Fri">Sex</div>
          <div data-en="Sat">Sáb</div>
        </div>
        <div class="grid grid-cols-7 gap-4">
          {days.value.map((day, dayIdx) => (
            <div
              key={day.toString()}
              class={`${dayIdx === 0 ? colStartClasses[getDay(day)] : ""}`}
            >
              <button
                type="button"
                onClick$={() => {
                  selectedDay.value = day;
                }}
                disabled={isBefore(day, startOfToday())}
                class={calendarStyles({
                  isBeforeToday: isBefore(day, startOfToday()),
                  isSelected: isEqual(day, selectedDay.value),
                  isToday: isToday(day),
                  isSameMonth: isSameMonth(day, firstDayCurrentMonth.value),
                })}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>
                  {format(day, "d")}
                </time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
