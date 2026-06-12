import { PublicHeader } from "@/components/layout/public/public-header";
import { PublicFooter } from "@/components/layout/public/public-footer";
import { CookieConsentBanner } from "@/components/modules/lgpd/cookie-consent-banner";
import { SiteSchema } from "@/components/seo/site-schema";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteSchema />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <CookieConsentBanner />
    </div>
  );
}
