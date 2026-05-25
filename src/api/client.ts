import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export function useMocks(): boolean {
  return import.meta.env.VITE_USE_MOCKS === 'true'
}

export default api
