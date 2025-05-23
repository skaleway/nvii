import axios, { AxiosInstance } from "axios";
import { readConfigFile } from "./index";

// Create a base client without headers
export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {},
});

export async function getConfiguredClient(): Promise<AxiosInstance> {
  const config = await readConfigFile();

  if (!config) {
    return apiClient;
  }

  return axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
      "X-Auth-Code": config.code,
      "X-Auth-Key": config.key,
      "X-User-Id": config.userId,
      "X-Device-Id": config.deviceId,
    },
  });
}
