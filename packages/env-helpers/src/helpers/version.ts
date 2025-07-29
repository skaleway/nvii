import { EnvVersion, User } from "@nvii/db";
import { getConfiguredClient } from "./api-client";

export type VersionWithUser = EnvVersion & {
  user: Pick<User, "name" | "email" | "id">;
};

/**
 * Fetches the version history for a given project.
 * @param userId The ID of the user.
 * @param projectId The ID of the project.
 * @param limit Optional limit for the number of versions to fetch.
 * @returns A promise that resolves to an array of versions.
 */
export async function fetchVersions(
  userId: string,
  projectId: string,
  limit?: number,
): Promise<VersionWithUser[]> {
  const client = await getConfiguredClient();
  if (!client) {
    throw new Error("Failed to obtain configured API client.");
  }
  const limitQuery = limit ? `?limit=${limit}` : "";
  const response = await client.get(
    `/projects/${userId}/${projectId}/versions${limitQuery}`,
  );

  return response.data as VersionWithUser[];
}

/**
 * Fetches a single version by its ID.
 * @param userId The ID of the user.
 * @param projectId The ID of the project.
 * @param versionId The ID of the version to fetch.
 * @returns A promise that resolves to the version.
 */
export async function getVersion(
  userId: string,
  projectId: string,
  versionId: string,
): Promise<EnvVersion> {
  const client = await getConfiguredClient();
  if (!client) {
    throw new Error("Failed to obtain configured API client.");
  }
  const response = await client.get(
    `/projects/${userId}/${projectId}/versions/${versionId}`,
  );
  return response.data as EnvVersion;
}
