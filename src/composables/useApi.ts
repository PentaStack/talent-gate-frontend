import api from "@/api/client";
import { useAuthStore } from "@/stores/auth";

export function useApi() {
  const auth = useAuthStore();

  async function request(promise: Promise<any>) {
    try {
      return await promise;
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        // logout silently
        await auth.logout();
        throw { status: 401, message: "Unauthenticated" };
      }

      if (status === 422) {
        const errors = err.response.data.errors || {};
        throw { status: 422, errors };
      }

      throw err;
    }
  }

  return { api, request };
}
