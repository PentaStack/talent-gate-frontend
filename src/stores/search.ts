import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { fetchSearchJobs, fetchCategories, fetchLocations } from "@/api/jobs";
import type { JobListing, Category, Location, JobFilters } from "@/api/jobs";

export interface SearchFilters {
  location: string;
  work_type: "remote" | "onsite" | "hybrid" | "";
  experience_level: "entry" | "mid" | "senior" | "lead" | "";
  /** Category slug */
  category: string;
  /** YYYY-MM-DD */
  date_from: string;
}

const EMPTY_FILTERS: SearchFilters = {
  location: "",
  work_type: "",
  experience_level: "",
  category: "",
  date_from: "",
};

export const useSearchStore = defineStore("search", () => {
  const query = ref("");
  const sort = ref<"newest" | "deadline">("newest");
  const filters = ref<SearchFilters>({ ...EMPTY_FILTERS });

  const jobs = ref<JobListing[]>([]);
  const meta = ref({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const isLoading = ref(false);

  const categories = ref<Category[]>([]);
  const locations = ref<Location[]>([]);
  const optionsLoaded = ref(false);

  const activeFilterCount = computed(
    () => Object.values(filters.value).filter(Boolean).length,
  );
  const hasActiveFilters = computed(
    () => activeFilterCount.value > 0 || !!query.value.trim(),
  );

  async function loadJobs(page = 1) {
    isLoading.value = true;
    try {
      const params: JobFilters = {
        page,
        sort: sort.value,
        q: query.value.trim() || undefined,
        experience_level:
          (filters.value.experience_level as JobFilters["experience_level"]) ||
          undefined,
        location: filters.value.location || undefined,
        work_type:
          (filters.value.work_type as JobFilters["work_type"]) || undefined,
        category: filters.value.category || undefined,
        date_from: filters.value.date_from || undefined,
      };
      const res = await fetchSearchJobs(params);
      jobs.value = res.data;
      meta.value = res.meta;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadOptions() {
    if (optionsLoaded.value) return;
    const [cats, locs] = await Promise.all([
      fetchCategories(),
      fetchLocations(),
    ]);
    categories.value = cats;
    locations.value = locs;
    optionsLoaded.value = true;
  }

  function resetFilters() {
    filters.value = { ...EMPTY_FILTERS };
    query.value = "";
    sort.value = "newest";
  }

  return {
    query,
    sort,
    filters,
    jobs,
    meta,
    isLoading,
    categories,
    locations,
    optionsLoaded,
    activeFilterCount,
    hasActiveFilters,
    loadJobs,
    loadOptions,
    resetFilters,
  };
});
