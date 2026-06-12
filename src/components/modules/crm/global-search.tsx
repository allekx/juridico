"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { Search, User, Briefcase, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { globalSearchAction } from "@/actions/crm/search";
import { LEAD_STATUS_LABELS } from "@/constants/crm";
import type { CrmSearchResult } from "@/types/crm";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CrmSearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    startTransition(async () => {
      const res = await globalSearchAction(value);
      if (res.success && res.data) {
        setResults(res.data);
        setOpen(true);
      }
    });
  }

  const total =
    (results?.leads.length ?? 0) +
    (results?.clients.length ?? 0) +
    (results?.cases.length ?? 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder="Buscar leads, clientes, casos..."
          className="pl-9 pr-9"
          inputSize="sm"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {total === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhum resultado para &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="p-2">
              {results.leads.length > 0 && (
                <SearchSection title="Leads" icon={<Users className="h-3.5 w-3.5" />}>
                  {results.leads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/dashboard/crm/leads?q=${encodeURIComponent(lead.name)}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      <span>{lead.name}</span>
                      <Badge variant="muted" className="text-2xs">
                        {LEAD_STATUS_LABELS[lead.status]}
                      </Badge>
                    </Link>
                  ))}
                </SearchSection>
              )}

              {results.clients.length > 0 && (
                <SearchSection title="Clientes" icon={<User className="h-3.5 w-3.5" />}>
                  {results.clients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/crm/clientes?q=${encodeURIComponent(client.name)}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      {client.name}
                      {client.cpfCnpj && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {client.cpfCnpj}
                        </span>
                      )}
                    </Link>
                  ))}
                </SearchSection>
              )}

              {results.cases.length > 0 && (
                <SearchSection title="Casos" icon={<Briefcase className="h-3.5 w-3.5" />}>
                  {results.cases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/crm/casos?q=${encodeURIComponent(c.title)}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      {c.title}
                      {c.caseNumber && (
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {c.caseNumber}
                        </span>
                      )}
                    </Link>
                  ))}
                </SearchSection>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
