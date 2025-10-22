import { allDocs, Doc } from "content-collections";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx/content";
import { Heading, Section } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string[] }>;
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

  const headings = doc!.headings as Heading[];
  const sections = headings.map((heading, i) => {
    return {
      id: i,
      title: heading.text,
      offsetRem: undefined,
    };
  });

  return (
    <div className="lg:px-0 px-4">
      <div className="max-w-3xl mx-auto w-full min-h-screen space-y-6 py-20">
        <MDXContent doc={doc} headings={headings} sections={sections} />
      </div>
    </div>
  );
};

export default Page;
