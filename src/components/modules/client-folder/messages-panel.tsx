"use client";

import { useState, useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendClientMessageAction } from "@/actions/client-folder";
import type { ClientMessageItem } from "@/types/client-folder";

interface MessagesPanelProps {
  clientId: string;
  messages: ClientMessageItem[];
  canWrite?: boolean;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessagesPanel({
  clientId,
  messages,
  canWrite = true,
}: MessagesPanelProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await sendClientMessageAction(clientId, { subject, body });
      if (result.success) {
        setSubject("");
        setBody("");
        window.location.reload();
      } else {
        setError(result.error ?? "Erro ao enviar");
      }
    });
  }

  return (
    <div className="space-y-6">
      {canWrite && (
        <form onSubmit={handleSend} className="ds-surface space-y-4 p-5">
          <div className="ds-input-group">
            <Label htmlFor="subject">Assunto (opcional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto da mensagem"
              disabled={isPending}
            />
          </div>
          <div className="ds-input-group">
            <Label htmlFor="body">Mensagem *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Escreva sua mensagem..."
              required
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar mensagem
          </Button>
        </form>
      )}

      {messages.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma mensagem registrada.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-lg border border-border/60 bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {msg.subject && (
                    <p className="font-medium">{msg.subject}</p>
                  )}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {msg.body}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {msg.authorName} · {formatDate(msg.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
