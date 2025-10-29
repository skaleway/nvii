export interface Heading {
  level: number;
  text: string;
}

export interface Section {
  id: number;
  title: string;
  offsetRem: number | undefined;
  slug: string;
}
