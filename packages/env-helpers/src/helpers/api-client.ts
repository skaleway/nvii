import axios, { AxiosInstance } from "axios";
import { readConfigFile } from "./index";

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
      "X-User-Id": config.userId,
      "X-Device-Id": config.deviceId,
    },
  });
}
