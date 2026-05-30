import api from "@/api/client";

export interface Technology {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface JobListing {
  id: number;
  title: string;
  description: string | null;
  salary_range: string | null;
  work_type: "remote" | "onsite" | "hybrid" | null;
  location: string | null;
  experience_level: "entry" | "mid" | "senior" | "lead" | null;
  application_deadline: string | null;
  category: Category | null;
  technologies: Technology[];
  employer: {
    company_name: string;
    logo_url: string | null;
  };
}

export interface JobDetail extends JobListing {
  requirements: string | null;
  views_count: number;
  created_at: string | null;
  employer: {
    company_name: string;
    logo_url: string | null;
    bio: string | null;
    website: string | null;
  };
}

export interface JobFilters {
  q?: string;
  sort?: "newest" | "deadline";
  page?: number;
  per_page?: number;
  experience_level?: "entry" | "mid" | "senior" | "lead";
}

export async function fetchJobs(
  filters: JobFilters = {},
): Promise<{
  data: JobListing[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> {
  const params: Record<string, string | number> = {};
  if (filters.q) params.q = filters.q;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;
  if (filters.experience_level)
    params.experience_level = filters.experience_level;
  const { data } = await api.get("/v1/jobs", { params });
  return data;
}

export async function fetchJob(id: number): Promise<JobDetail> {
  const { data } = await api.get(`/v1/jobs/${id}`);
  return data.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get("/v1/categories");
  return data.data;
}

export async function fetchTechnologies(): Promise<Technology[]> {
  const { data } = await api.get("/v1/technologies");
  return data.data;
}
