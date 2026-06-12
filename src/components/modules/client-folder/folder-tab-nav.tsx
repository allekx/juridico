import Link from "next/link";
import { cn } from "@/lib/utils";
import { CLIENT_FOLDER_TABS } from "@/constants/client-folder";
import type { ClientFolderTab } from "@/types/client-folder";

interface FolderTabNavProps {
  clientId: string;
  activeTab: ClientFolderTab;
  counts: Record<ClientFolderTab, number>;
}

export function FolderTabNav({ clientId, activeTab, counts }: FolderTabNavProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
      {CLIENT_FOLDER_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={`/dashboard/documentos/${clientId}?tab=${tab.id}`}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-gold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-2xs">
              {counts[tab.id]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
