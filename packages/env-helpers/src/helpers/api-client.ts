import axios, { AxiosInstance } from "axios";
import { readConfigFile } from "./index";
import { API_URLS } from "./constants";

export const apiClient = axios.create({
  baseURL: API_URLS.BASE_URL,
  headers: {},
});

export async function getConfiguredClient(): Promise<AxiosInstance> {
  const config = await readConfigFile();

  if (!config) {
    return apiClient;
  }

  return axios.create({
    baseURL: API_URLS.BASE_URL,
    headers: {
      "X-Auth-Code": config.code,
      "X-User-Id": config.userId,
      "X-Device-Id": config.deviceId,
    },
  });
}
