import type { Metadata } from "next";
import { SEO_DEFAULTS } from "@/constants/seo";
import { absoluteUrl } from "@/lib/seo/site-url";

export interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  ogType?: "website" | "article";
  image?: string | string[];
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
}

function resolveImages(
  image: string | string[] | undefined,
  title: string
): { url: string; alt: string }[] {
  const sources = image
    ? Array.isArray(image)
      ? image
      : [image]
    : [SEO_DEFAULTS.defaultOgImage];

  return sources.map((src) => ({
    url: src.startsWith("http") ? src : absoluteUrl(src),
    alt: title,
  }));
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    path = "/",
    ogType = "website",
    image,
    imageAlt,
    publishedTime,
    modifiedTime,
    authors,
    keywords,
    noIndex = false,
  } = options;

  const canonical = path.startsWith("/") ? path : `/${path}`;
  const url = absoluteUrl(canonical);
  const images = resolveImages(image, imageAlt ?? title);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url,
      siteName: SEO_DEFAULTS.siteName,
      locale: SEO_DEFAULTS.locale,
      type: ogType,
      images,
      ...(ogType === "article" && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((item) => item.url),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ),
    title: {
      default: SEO_DEFAULTS.defaultTitle,
      template: `%s | ${SEO_DEFAULTS.siteName}`,
    },
    description: SEO_DEFAULTS.defaultDescription,
    keywords: [...SEO_DEFAULTS.defaultKeywords],
    authors: [{ name: SEO_DEFAULTS.siteName }],
    creator: SEO_DEFAULTS.siteName,
    publisher: SEO_DEFAULTS.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: SEO_DEFAULTS.locale,
      siteName: SEO_DEFAULTS.siteName,
      title: SEO_DEFAULTS.defaultTitle,
      description: SEO_DEFAULTS.defaultDescription,
      images: [
        {
          url: absoluteUrl(SEO_DEFAULTS.defaultOgImage),
          alt: SEO_DEFAULTS.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_DEFAULTS.defaultTitle,
      description: SEO_DEFAULTS.defaultDescription,
      images: [absoluteUrl(SEO_DEFAULTS.defaultOgImage)],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "geo.region": SEO_DEFAULTS.geo.region,
      "geo.placename": SEO_DEFAULTS.geo.placename,
      "geo.position": SEO_DEFAULTS.geo.position,
      ICBM: SEO_DEFAULTS.geo.position.replace(";", ", "),
    },
  };
}
