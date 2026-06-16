"use client";

import { getTriageAreaTitle } from "@/lib/triage/report";
import { buildTriageReportText } from "@/lib/triage/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriageDocumentList } from "@/components/modules/crm/triage-document-list";
import type { CrmLeadTriageDetail } from "@/types/crm";

interface TriageReportCardProps {
  triage: CrmLeadTriageDetail;
  leadName: string;
  leadEmail: string | null;
  leadPhone: string | null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TriageReportCard({
  triage,
  leadName,
  leadEmail,
  leadPhone,
}: TriageReportCardProps) {
  const reportText = buildTriageReportText({
    practiceAreaSlug: triage.practiceAreaSlug,
    name: leadName,
    email: leadEmail,
    phone: leadPhone,
    cpfCnpj: triage.cpfCnpj,
    city: triage.city,
    state: triage.state,
    additionalNotes: triage.additionalNotes,
    answers: triage.answers,
    lawyerName: triage.lawyerName,
    lawyerOab: triage.lawyerOab,
    documents: triage.documents,
    completedAt: triage.completedAt,
  });

  return (
    <div className="space-y-4">
      <Card id="triage-report">
        <CardHeader>
          <CardTitle className="text-lg">Relatório da triagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Área jurídica
            </p>
            <p className="font-display text-lg font-semibold">
              {getTriageAreaTitle(triage.practiceAreaSlug)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Respostas do cliente
            </p>
            <ul className="space-y-2 text-sm">
              {triage.answers.map((answer) => (
                <li
                  key={`${answer.questionLabel}-${answer.answer}`}
                  className="rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <span className="text-muted-foreground">
                    {answer.questionLabel}:
                  </span>{" "}
                  {answer.answer}
                </li>
              ))}
            </ul>
          </div>

          {triage.additionalNotes && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Observações
              </p>
              <p className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm whitespace-pre-wrap">
                {triage.additionalNotes}
              </p>
            </div>
          )}

          {triage.lawyerName && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Advogado escolhido
              </p>
              <p className="text-sm font-medium">{triage.lawyerName}</p>
              {triage.lawyerOab && (
                <p className="text-sm text-muted-foreground">{triage.lawyerOab}</p>
              )}
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Documentos anexados
            </p>
            {triage.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum documento enviado na triagem.
              </p>
            ) : (
              <TriageDocumentList
                documents={triage.documents.map((doc) => ({
                  ...doc,
                  sizeLabel: formatFileSize(doc.fileSize),
                }))}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Imprimir relatório
        </Button>
        <Button type="button" variant="outline" asChild>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(reportText)}`}
            download={`triagem-${leadName.replace(/\s+/g, "-").toLowerCase()}.txt`}
          >
            Baixar relatório (.txt)
          </a>
        </Button>
      </div>

      <pre className="hidden print:block whitespace-pre-wrap text-sm">
        {reportText}
      </pre>
    </div>
  );
}
