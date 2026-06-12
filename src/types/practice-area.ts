import type { LucideIcon } from "lucide-react";

export interface PracticeAreaBenefit {
  title: string;
  description: string;
}

export interface PracticeAreaFaq {
  question: string;
  answer: string;
}

export interface PracticeAreaDetail {
  slug: string;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  metaDescription: string;
  banner: {
    overline: string;
    title: string;
    subtitle: string;
  };
  description: {
    title: string;
    paragraphs: string[];
  };
  benefits: {
    title: string;
    items: PracticeAreaBenefit[];
  };
  cases: {
    title: string;
    items: string[];
  };
  faq: PracticeAreaFaq[];
  cta: {
    title: string;
    description: string;
  };
}

export interface PracticeAreaSummary {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
}
