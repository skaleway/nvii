import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  SingleParserBuilder,
  Values,
} from "nuqs";

export const searchParamsSchema = {
  redirect: parseAsString,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(30),
  search: parseAsString.withDefault(""),
};

type ParamsTypes = Values<{
  redirect: SingleParserBuilder<string>;
  page: SingleParserBuilder<number>;
  limit: SingleParserBuilder<number>;
  search: SingleParserBuilder<string>;
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

// To be used on the server
export const loadSearchParams = createLoader(searchParamsSchema);
