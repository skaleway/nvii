import { Intersection } from "@/components/intersection";
import { MDXContent } from "@/components/mdx/content";
import { Timeline } from "@/components/navigation";
import { siteConfig } from "@/lib/site";
import { Heading } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { allDocs, Doc } from "content-collections";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) {
    return {};
  }

  return {
    title: {
      default: doc.title,
      template: `%s | ${doc.title}`,
    },
    description: doc.summary,
    openGraph: {
      title: doc.title,
      type: "article",
      description: doc.summary,
      images: [siteConfig.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.summary,
      images: [siteConfig.ogImage],
      creator: "@nvii",
    },
  };
}

export function generateStaticParams() {
  return allDocs.map((doc) => ({ slug: doc._meta.path.split("/") }));
}

const getDoc = (slug: string[]): Doc | undefined => {
  const path = slug.join("/");

  const [doc] = allDocs.filter((doc) => doc._meta.path.startsWith(path));

  return doc;
};

const Page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) {
    notFound();
  }

  const headings = doc.headings as Heading[];

  const sections = headings.map((heading: Heading, i: number) => {
    return {
      id: i,
      title: heading.text,
      offsetRem: undefined,
      slug: slugify(heading.text.toLowerCase()),
    };
  });

  return (
    <Intersection headings={headings}>
      <div className="max-w-3xl px-4 mx-auto bg-background md:border-x w-full min-h-screen space-y-6 py-20">
        <MDXContent doc={doc} sections={sections} />
        <Timeline />
      </div>
    </Intersection>
  );
};

export default Page;
