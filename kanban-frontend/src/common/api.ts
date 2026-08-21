import axios from "axios";

export const publicInstance = axios.create({
  baseURL: "http://localhost:3000",
});

publicInstance.interceptors.response.use(
  async (response: any) => response,
  async (error: { config: any; response: { status: number } }) =>
    Promise.reject(error.response),
);

export const apiPublic = publicInstance;
