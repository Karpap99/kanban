import axios from "axios";

export const publicInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

publicInstance.interceptors.response.use(
  async (response: any) => response,
  async (error: { config: any; response: { status: number } }) =>
    Promise.reject(error.response),
);

export const apiPublic = publicInstance;
