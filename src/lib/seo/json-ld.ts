import { OFFICE_INFO } from "@/constants/home-content";
import { SEO_DEFAULTS } from "@/constants/seo";
import type { BlogPostDetail } from "@/types/blog";
import type { PracticeAreaDetail } from "@/types/practice-area";
import { absoluteUrl } from "@/lib/seo/site-url";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": absoluteUrl("/#organization"),
    name: OFFICE_INFO.name,
    description: SEO_DEFAULTS.defaultDescription,
    url: absoluteUrl("/"),
    logo: absoluteUrl(SEO_DEFAULTS.defaultOgImage),
    image: absoluteUrl(SEO_DEFAULTS.defaultOgImage),
    telephone: OFFICE_INFO.phone,
    email: OFFICE_INFO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: OFFICE_INFO.address,
      addressLocality: "São Paulo",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
    priceRange: "$$",
    sameAs: [],
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: OFFICE_INFO.name,
    url: absoluteUrl("/"),
    description: SEO_DEFAULTS.defaultDescription,
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: SEO_DEFAULTS.language,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/blog")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqSchema(
  items: ReadonlyArray<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildArticleSchema(post: BlogPostDetail, path: string) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : [absoluteUrl(SEO_DEFAULTS.defaultOgImage)],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: OFFICE_INFO.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SEO_DEFAULTS.defaultOgImage),
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    keywords: post.tags.map((tag) => tag.name).join(", "),
    articleSection: post.category?.name,
    inLanguage: SEO_DEFAULTS.language,
  };
}

export function buildBlogSchema(posts: { title: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": absoluteUrl("/blog#blog"),
    name: `Blog Jurídico | ${OFFICE_INFO.name}`,
    description:
      "Artigos, análises e orientações jurídicas sobre direito trabalhista, empresarial, família e mais.",
    url: absoluteUrl("/blog"),
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: SEO_DEFAULTS.language,
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
    })),
  };
}

export function buildPracticeAreaSchema(area: PracticeAreaDetail) {
  const path = `/areas-de-atuacao/${area.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`${path}#service`),
    name: area.title,
    description: area.metaDescription,
    url: absoluteUrl(path),
    provider: { "@id": absoluteUrl("/#organization") },
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
    serviceType: area.shortTitle,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/triagem"),
      description: "Primeira consulta gratuita disponível.",
    },
  };
}

export function buildPracticeAreaFaqSchema(area: PracticeAreaDetail) {
  if (area.faq.length === 0) return null;
  return buildFaqSchema(area.faq);
}

export function buildWebPageSchema(options: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.title,
    description: options.description,
    url: absoluteUrl(options.path),
    isPartOf: { "@id": absoluteUrl("/#website") },
    inLanguage: SEO_DEFAULTS.language,
  };
}
