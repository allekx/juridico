import type { LegalDocumentView } from "@/types/lgpd";

interface LegalDocumentContentProps {
  document: LegalDocumentView;
}

function renderBlock(block: string, index: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("## ")) {
    return (
      <h2 key={index} className="mt-8 font-display text-xl font-semibold first:mt-0">
        {trimmed.replace(/^##\s+/, "")}
      </h2>
    );
  }

  if (trimmed.startsWith("### ")) {
    return (
      <h3 key={index} className="mt-6 font-display text-lg font-semibold">
        {trimmed.replace(/^###\s+/, "")}
      </h3>
    );
  }

  const html = trimmed
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");

  return (
    <p
      key={index}
      className="mt-3 text-sm leading-relaxed text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function LegalDocumentContent({ document }: LegalDocumentContentProps) {
  const blocks = document.content.split("\n\n");

  return (
    <article className="ds-surface mt-8 p-6 md:p-10">
      <div className="mb-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Versão {document.version}</span>
        {document.publishedAt && (
          <span>
            Publicado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date(document.publishedAt))}
          </span>
        )}
      </div>
      <div>{blocks.map(renderBlock)}</div>
    </article>
  );
}
