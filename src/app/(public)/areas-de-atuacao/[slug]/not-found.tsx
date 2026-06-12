import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Lead } from "@/components/ui/typography";

export default function PracticeAreaNotFound() {
  return (
    <section className="ds-section">
      <div className="ds-container">
        <div className="mx-auto max-w-lg text-center">
          <Heading>Área não encontrada</Heading>
          <Lead className="mt-4">
            A área de atuação que você procura não existe ou foi removida.
          </Lead>
          <Button asChild className="mt-8">
            <Link href="/areas-de-atuacao">
              <ArrowLeft className="h-4 w-4" />
              Ver todas as áreas
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
