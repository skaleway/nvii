import { Icons } from "@workspace/ui/components/icons";

import React, { useMemo } from "react";

interface SidebarRoute {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const useSidebarRoutes = (teamId?: string) => {
  return useMemo(() => {
    if (!teamId) return [];

    const routes: SidebarRoute[] = [
      { title: "Spaces", url: `/t/${teamId}`, icon: Icons.spaces },
      {
        title: "Permissions",
        url: `/t/${teamId}/permissions`,
        icon: Icons.permisions,
      },
      {
        title: "Activity",
        url: `/t/${teamId}/activity`,
        icon: Icons.analytics,
      },
      { title: "Settings", url: `/t/${teamId}/settings`, icon: Icons.settings },
      { title: "Members", url: `/t/${teamId}/members`, icon: Icons.members },
    ];
    return routes;
  }, [teamId]);
};

export const marketingLinks = [
  {
    title: "Integrations",
    url: "#integrations",
  },
  {
    title: "Features",
    url: "#features",
  },
  {
    title: "Contact",
    url: "#contact",
  },
];
