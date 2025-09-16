"use server";

import { db, EnvVersion, Project } from "@nvii/db";

export async function getProjectData(
  projectId: string,
  userId: string,
): Promise<{ project: Project; versions: EnvVersion[] } | null> {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      ProjectAccess: {
        where: {
          userId,
        },
      },
    },
  });

  if (
    !project ||
    (project.userId !== userId && project.ProjectAccess.length === 0)
  ) {
    return null;
  }

  const versions = await db.envVersion.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    project,
    versions,
  };
}
