import { component$, type QRL, type Signal } from "@builder.io/qwik";
import { MAX_CATEGORIES, MAX_TAGS } from "~/constants";
type ByTagsCategoriesProps = {
  categories: string[];
  localFilterCategories: Signal<string[]>;
  localFilterTags: Signal<string[]>;
  addTag$: QRL<() => void>;
  newTagInputRef: Signal<HTMLInputElement | undefined>;
};
export default component$<ByTagsCategoriesProps>(
  ({
    categories,
    localFilterCategories,
    addTag$,
    localFilterTags,
    newTagInputRef,
  }) => {
    return (
      <div class="h-full  space-y-6 px-5 py-6">
        <div class="space-y-2">
          <p class="text-xl font-bold">Categorias</p>
          <p>
            Filtre ate <strong>3 categorias</strong>
          </p>

          <div class="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isInFilter = localFilterCategories.value.includes(category);

              return (
                <button
                  type="button"
                  disabled={
                    localFilterCategories.value.length === MAX_CATEGORIES &&
                    !isInFilter
                  }
                  onClick$={() => {
                    if (isInFilter) {
                      localFilterCategories.value =
                        localFilterCategories.value.filter(
                          (cat) => cat !== category,
                        );

                      return;
                    }

                    localFilterCategories.value = [
                      ...new Set([...localFilterCategories.value, category]),
                    ];
                  }}
                  key={category}
                >
                  <span
                    class={[
                      "rounded-full border bg-black px-4 py-1 text-sm font-semibold text-white",
                      isInFilter ? "opacity-100" : "opacity-40",
                    ]}
                  >
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xl font-bold">Tags</p>
          <p>
            Filtre ate <strong>5 tags</strong>
          </p>

          <div class="relative text-[#9e9e9e] focus-within:text-[#ff7b0d]">
            <svg
              class="absolute left-2 top-1/2 h-auto w-5 -translate-y-1/2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6"
              />
            </svg>

            <input
              ref={newTagInputRef}
              type="text"
              class="w-full rounded-lg border-2 border-[#9e9e9e] p-2 px-8 caret-[#ff7b0d] focus:text-[#9e9e9e]  focus:outline-[#ff7b0d]"
              placeholder="Adicione uma tag"
              name="tag"
              onKeyDown$={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag$();
                }
              }}
              disabled={localFilterTags.value.length === MAX_TAGS}
            />

            <button
              type="button"
              onClick$={() => addTag$()}
              class="absolute right-0 top-1/2 flex aspect-square h-full -translate-y-1/2 items-center justify-center rounded-full text-[#9e9e9e] hover:bg-gray-200"
            >
              <svg
                class="h-auto w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m4 8.25l7.51 1l-7.5-3.22zm.01 9.72l7.5-3.22l-7.51 1z"
                  opacity="0.3"
                />
                <path
                  fill="currentColor"
                  d="M2.01 3L2 10l15 2l-15 2l.01 7L23 12zM4 8.25V6.03l7.51 3.22zm.01 9.72v-2.22l7.51-1z"
                />
              </svg>
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            {localFilterTags.value.map((tag) => (
              <div
                key={tag}
                class="flex items-center gap-1.5 rounded-full border border-[#858585] px-3 py-1"
              >
                <span class="text-sm font-medium">
                  <strong>#</strong>
                  {tag}
                </span>
                <button
                  type="button"
                  onClick$={() => {
                    localFilterTags.value = localFilterTags.value.filter(
                      (t) => t !== tag,
                    );
                  }}
                >
                  <svg
                    class="h-auto w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="currentColor"
                      d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12"
                    />
                    <path
                      fill="currentColor"
                      d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
