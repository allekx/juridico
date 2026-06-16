import { createAdminClient } from "@/lib/supabase/admin";

export async function getTriageDocumentSignedUrl(
  storagePath: string
): Promise<string | null> {
  if (storagePath.startsWith("local:")) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from("triage-documents")
      .createSignedUrl(storagePath, 60 * 60);

    if (error || !data?.signedUrl) {
      console.error("[storage] signed url:", error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("[storage] getTriageDocumentSignedUrl:", error);
    return null;
  }
}
