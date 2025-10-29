import { Intersection } from "@/components/intersection";
import { MDXContent } from "@/components/mdx/content";
import { Timeline } from "@/components/navigation";
import { footerRoutes } from "@/lib/constants";
import { siteConfig } from "@/lib/site";
import { Heading } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { allDocs, Doc } from "content-collections";
import Link from "next/link";
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

  const currentYear = new Date().getFullYear();

  return (
    <Intersection headings={headings}>
      <div className="max-w-3xl px-4 mx-auto bg-background md:border-x w-full min-h-screen space-y-6 pt-20 pb-10">
        <MDXContent doc={doc} sections={sections} />
        <Timeline />

        <footer className="mt-20 border-t border-dashed  pt-20 space-y-4">
          <h2 className="text-2xl font-bold">Feedback</h2>
          <p className="text-muted-foreground">
            Have feedback or suggestions? Let us know by sending an email to{" "}
            <a
              href="mailto:hello@bossadizenith.me"
              className="text-primary font-medium"
            >
              hello@bossadizenith.me
            </a>
            . You can also reach out to me on{" "}
            <a
              href="https://bossadizenith.me/x"
              className="text-primary font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              X (Bossadi Zenith){" "}
            </a>
            if you got any questions or suggestions.
          </p>
          <p className="text-muted-foreground">
            You can also contribute to the project by submitting a pull request
            to the{" "}
            <a
              href="https://github.com/skaleway/nvii"
              className="text-primary font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repository
            </a>{" "}
            by opening an issue or submitting a pull request.
          </p>
          <div className="flex items-center md:flex-row flex-col gap-4 justify-between">
            <p className="text-sm text-muted-foreground">
              &copy;{currentYear} Skaleway. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {footerRoutes.map(
                (route: {
                  name: string;
                  link: string;
                  icon: React.ComponentType<{ className?: string }>;
                }) => (
                  <Link
                    key={route.name}
                    href={route.link}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <route.icon className="w-4 h-4" />
                  </Link>
                )
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-20">
            Made out of frustration by the guys at{" "}
            <a
              href={siteConfig.links.team}
              className="text-primary font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Skaleway.
            </a>
          </p>
        </footer>
      </div>
    </Intersection>
  );
};

export default Page;
