import { watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearchStore } from "@/stores/search";

/**
 * Composable that wires the search store to URL query params.
 * Supports shareable links — all filter state is reflected in the URL.
 * Used by JobSearchView.vue.
 */
export function useJobSearch() {
  const route = useRoute();
  const router = useRouter();
  const store = useSearchStore();

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ── URL sync ──────────────────────────────────────────────────────────────

  function syncToUrl() {
    const q: Record<string, string> = {};
    if (store.query.trim()) q.q = store.query.trim();
    if (store.sort !== "newest") q.sort = store.sort;
    if (store.filters.location) q.location = store.filters.location;
    if (store.filters.work_type) q.work_type = store.filters.work_type;
    if (store.filters.experience_level)
      q.experience_level = store.filters.experience_level;
    if (store.filters.category) q.category = store.filters.category;
    if (store.filters.date_from) q.date_from = store.filters.date_from;
    router.replace({ query: q });
  }

  function initFromUrl() {
    const q = route.query;
    store.query = (q.q as string) ?? "";
    store.sort = q.sort === "deadline" ? "deadline" : "newest";
    store.filters.location = (q.location as string) ?? "";
    store.filters.work_type = ((q.work_type as string) ??
      "") as typeof store.filters.work_type;
    store.filters.experience_level = ((q.experience_level as string) ??
      "") as typeof store.filters.experience_level;
    store.filters.category = (q.category as string) ?? "";
    store.filters.date_from = (q.date_from as string) ?? "";
  }

  // ── Scheduling ────────────────────────────────────────────────────────────

  function scheduleSearch(page = 1) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncToUrl();
      store.loadJobs(page);
    }, 350);
  }

  function goToPage(page: number) {
    syncToUrl();
    store.loadJobs(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Watchers ──────────────────────────────────────────────────────────────

  watch(
    () => store.query,
    () => scheduleSearch(1),
  );

  watch(
    () => store.sort,
    () => {
      syncToUrl();
      store.loadJobs(1);
    },
  );

  watch(
    () => ({ ...store.filters }),
    () => scheduleSearch(1),
    { deep: true },
  );

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  onMounted(async () => {
    initFromUrl();
    await Promise.all([store.loadOptions(), store.loadJobs(1)]);
  });

  return { store, goToPage };
}
