import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateCliAuth } from "../../../route";

export async function GET(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const { userId, projectId } = await params;

    // Authentication
    const headersList = await headers();
    const cliUser = await validateCliAuth(headersList);
    const webUser = await getCurrentUserFromSession();

    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    // Verify user has access to the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          {
            ProjectAccess: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    // Get all versions for analytics
    const versions = await db.envVersion.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (versions.length === 0) {
      return NextResponse.json({
        totalVersions: 0,
        changeFrequency: [],
        mostChangedVariables: [],
        userActivity: [],
        timelineData: [],
      });
    }

    // Calculate change frequency (versions per day over the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentVersions = versions.filter(
      (v) => new Date(v.createdAt) >= thirtyDaysAgo,
    );

    const changeFrequency = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const versionsOnDay = recentVersions.filter(
        (v) => v.createdAt.toISOString().split("T")[0] === dateStr,
      ).length;

      changeFrequency.push({
        date: dateStr,
        changes: versionsOnDay,
      });
    }

    // Calculate most changed variables
    const variableChanges = new Map<string, number>();

    versions.forEach((version) => {
      const changes = version.changes as any;
      if (changes) {
        // Count added variables
        if (changes.added && Array.isArray(changes.added)) {
          changes.added.forEach((key: string) => {
            variableChanges.set(key, (variableChanges.get(key) || 0) + 1);
          });
        }

        // Count modified variables
        if (changes.modified && Array.isArray(changes.modified)) {
          changes.modified.forEach((key: string) => {
            variableChanges.set(key, (variableChanges.get(key) || 0) + 1);
          });
        }

        // Count deleted variables
        if (changes.deleted && Array.isArray(changes.deleted)) {
          changes.deleted.forEach((key: string) => {
            variableChanges.set(key, (variableChanges.get(key) || 0) + 1);
          });
        }
      }
    });

    const mostChangedVariables = Array.from(variableChanges.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([variable, changes]) => ({
        variable,
        changes,
      }));

    // Calculate user activity
    const userActivity = new Map<string, { user: any; changes: number }>();

    versions.forEach((version) => {
      const userId = version.user.id;
      if (!userActivity.has(userId)) {
        userActivity.set(userId, {
          user: version.user,
          changes: 0,
        });
      }
      userActivity.get(userId)!.changes++;
    });

    const userActivityArray = Array.from(userActivity.values()).sort(
      (a, b) => b.changes - a.changes,
    );

    // Calculate timeline data (versions over time)
    const timelineData = [];
    const monthlyData = new Map<string, number>();

    versions.forEach((version) => {
      const monthKey = version.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    });

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);

      timelineData.push({
        month: monthKey,
        versions: monthlyData.get(monthKey) || 0,
      });
    }

    return NextResponse.json({
      totalVersions: versions.length,
      changeFrequency,
      mostChangedVariables,
      userActivity: userActivityArray,
      timelineData,
      stats: {
        totalChanges: versions.length,
        uniqueVariables: variableChanges.size,
        activeUsers: userActivity.size,
        recentActivity: recentVersions.length,
      },
    });
  } catch (error) {
    console.error("[VERSION_ANALYTICS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
