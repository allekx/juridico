"use client";

import { useState, useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendPortalMessageAction } from "@/actions/portal/messages";
import type { PortalMessageItem } from "@/lib/portal/queries";
import { cn } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface PortalMessagesProps {
  messages: PortalMessageItem[];
}

export function PortalMessages({ messages }: PortalMessagesProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await sendPortalMessageAction(body, subject);
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
      <form onSubmit={handleSend} className="rounded-lg border bg-card p-5 space-y-4">
        <div className="ds-input-group">
          <Label htmlFor="subject">Assunto (opcional)</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="ds-input-group">
          <Label htmlFor="body">Sua mensagem *</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            required
            disabled={isPending}
            placeholder="Escreva sua dúvida ou solicitação..."
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Enviar
        </Button>
      </form>

      {messages.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          Nenhuma mensagem ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-lg border p-4",
                msg.isFromClient
                  ? "ml-4 border-gold/30 bg-gold-muted/20"
                  : "mr-4 border-border/60 bg-card"
              )}
            >
              {msg.subject && (
                <p className="font-medium">{msg.subject}</p>
              )}
              <p className="mt-1 whitespace-pre-wrap text-sm">{msg.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {msg.isFromClient ? "Você" : msg.authorName} ·{" "}
                {formatDate(msg.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
