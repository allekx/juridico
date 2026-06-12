import { JsonLd } from "@/components/seo/json-ld";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo/json-ld";

export function SiteSchema() {
  return (
    <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
  );
}
