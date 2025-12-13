import { parseAsString, type SingleParserBuilder, type Values } from "nuqs";

export const searchParamsSchema = {
  redirect: parseAsString,
  page: parseAsString.withDefault("1"),
  limit: parseAsString.withDefault("30"),
};

type ParamsTypes = Values<{
  redirect: SingleParserBuilder<string>;
  page: SingleParserBuilder<number>;
  limit: SingleParserBuilder<number>;
}>;

// Helper function to build URLs with current params
export const buildUrl = (
  href: string,
  overrides: Partial<typeof searchParamsSchema> = {},
  params: ParamsTypes
) => {
  const newParams = new URLSearchParams();
  const merged = { ...params, ...overrides };

  Object.entries(merged).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      newParams.set(key, value as string);
    }
  });

  return `${href}?${newParams.toString()}`;
};
