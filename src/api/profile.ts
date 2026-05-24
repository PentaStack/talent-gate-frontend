import api from "@/api/client";

export async function getProfile() {
  const { data } = await api.get("/v1/profile");
  return data.data;
}

export async function updateProfile(payload: any) {
  const { data } = await api.put("/v1/profile", payload);
  return data;
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post("/v1/profile/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function uploadResume(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/v1/profile/resume", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function deleteResume() {
  const { data } = await api.delete("/v1/profile/resume");
  return data;
}

export async function getPublicCandidate(userId: string) {
  const { data } = await api.get(`/v1/profile/${userId}`);
  return data.data;
}

export async function getResumeLink(userId: string) {
  const { data } = await api.get(`/v1/profile/${userId}/resume-link`);
  return data.data;
}
