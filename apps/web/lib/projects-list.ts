import { db, Prisma } from "@nvii/db";
import { z } from "zod";

/**
 * Query parameters shared by both project list routes.
 *
 * Each parameter is read once with `URLSearchParams.get`, so a repeated
 * parameter resolves to its first value (never the last). The shape mirrors
 * what zod validates downstream.
 */
export const listProjectsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().max(100).optional().default(""),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

/**
 * Reads limit, offset, and search once each from the query string (a repeated
 * parameter resolves to its first value) and validates them. Returns the
 * defaults when a parameter is absent. Throws a ZodError on invalid input,
 * which callers turn into a 400 with the standard error body.
 */
export function extractListQuery(
  searchParams: URLSearchParams
): ListProjectsQuery {
  return listProjectsQuerySchema.parse({
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
    search: searchParams.get("search"),
  });
}

/**
 * Projection for the web list route: every project scalar plus the access
 * rows (used for the "Shared by" badge) and the owner's id (the decryption
 * key).
 */
export const webProjectSelect: Prisma.ProjectSelect = {
  id: true,
  name: true,
  userId: true,
  key: true,
  deviceId: true,
  content: true,
  description: true,
  updatedAt: true,
  createdAt: true,
  ProjectAccess: {
    select: {
      projectId: true,
      userId: true,
      role: true,
      assignedAt: true,
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  },
  user: {
    select: { id: true },
  },
};

/**
 * Lean projection for the CLI list route: id, name, and the raw content
 * column returned untouched.
 */
export const cliProjectSelect: Prisma.ProjectSelect = {
  id: true,
  name: true,
  content: true,
};

export type ListProjectsInput<T extends Prisma.ProjectSelect = Prisma.ProjectSelect> = {
  viewerId: string;
  limit: number;
  offset: number;
  search: string;
  select: T;
};

export type ListProjectsResult<T extends Prisma.ProjectSelect = Prisma.ProjectSelect> = {
  items: Prisma.ProjectGetPayload<{ select: T }>[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * One shared list module: visibility filter, search filter, ordering, paging,
 * and the count live here once. Both list routes call it and format its rows
 * for their own caller, so the two routes can never drift apart on what a
 * caller can see.
 *
 * The visibility and search filters are combined under a single `AND`, never
 * as sibling `OR` keys on the same object (two `OR` keys is the same key
 * written twice and the second silently replaces the first, which is a
 * privacy bug).
 */
export async function listProjects<T extends Prisma.ProjectSelect>(
  input: ListProjectsInput<T>
): Promise<ListProjectsResult<T>> {
  const { viewerId, limit, offset, search, select } = input;

  const term = search.trim();
  const hasSearch = term.length > 0;
  const escaped = hasSearch ? term.replace(/([\\%_])/g, "\\$1") : "";

  const visibility = {
    OR: [
      { userId: viewerId },
      { ProjectAccess: { some: { userId: viewerId } } },
    ],
  };

  const where: Prisma.ProjectWhereInput = {
    AND: [
      visibility,
      ...(hasSearch
        ? [
            {
              OR: [
                {
                  name: { contains: escaped, mode: "insensitive" as const },
                },
                {
                  user: {
                    name: { contains: escaped, mode: "insensitive" as const },
                  },
                },
                {
                  user: {
                    email: { contains: escaped, mode: "insensitive" as const },
                  },
                },
              ],
            },
          ]
        : []),
    ],
  };

  const [items, total] = await db.$transaction([
    db.project.findMany({
      where,
      select,
      take: limit,
      skip: offset,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    db.project.count({ where }),
  ]);

  return { items, total, limit, offset };
}
