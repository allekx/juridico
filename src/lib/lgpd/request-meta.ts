import { headers } from "next/headers";
import type { RequestMetadata } from "@/types/lgpd";

export async function getRequestMetadata(): Promise<RequestMetadata> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    const ipAddress =
      forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined;
    const userAgent = h.get("user-agent") ?? undefined;

    return { ipAddress, userAgent };
  } catch {
    return {};
  }
}
