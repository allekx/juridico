import {
  HeroSection,
  DifferentialsSection,
  PracticeAreasSection,
  TeamSection,
  TestimonialsSection,
  StatsSection,
  CtaSection,
  FaqSection,
  ContactSection,
} from "@/components/modules/site/home";
import { JsonLd } from "@/components/seo/json-ld";
import { SEO_DEFAULTS } from "@/constants/seo";
import { FAQ_ITEMS } from "@/constants/home-content";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema } from "@/lib/seo/json-ld";

export const metadata = buildMetadata({
  title: SEO_DEFAULTS.defaultTitle,
  description: SEO_DEFAULTS.defaultDescription,
  path: "/",
  keywords: [...SEO_DEFAULTS.defaultKeywords],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildFaqSchema(FAQ_ITEMS)} />
      <HeroSection />
      <DifferentialsSection />
      <PracticeAreasSection />
      <TeamSection />
      <TestimonialsSection />
      <StatsSection />
      <CtaSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
