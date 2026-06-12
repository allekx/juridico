import { AreaBanner } from "./area-banner";
import { AreaDescription } from "./area-description";
import { AreaBenefits } from "./area-benefits";
import { AreaCases } from "./area-cases";
import { AreaFaq } from "./area-faq";
import { AreaCta } from "./area-cta";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface PracticeAreaTemplateProps {
  area: PracticeAreaDetail;
}

export function PracticeAreaTemplate({ area }: PracticeAreaTemplateProps) {
  return (
    <>
      <AreaBanner area={area} />
      <AreaDescription area={area} />
      <AreaBenefits area={area} />
      <AreaCases area={area} />
      <AreaFaq area={area} />
      <AreaCta area={area} />
    </>
  );
}
