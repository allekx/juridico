import {
  startTriageAction,
  saveTriageAnswersAction,
  saveTriageContactAction,
  skipDocumentsStepAction,
  skipLawyerStepAction,
  completeTriageAction,
} from "../src/actions/triage/index.ts";

async function main() {
  const area = "trabalhista" as const;

  const start = await startTriageAction(area);
  if (!start.success || !start.data) {
    throw new Error(`start failed: ${start.error}`);
  }

  const triageId = start.data.triageId;
  console.log("triageId", triageId);

  const answers = await saveTriageAnswersAction(triageId, {
    situacao: "empregado",
    tipo_demanda: "acidente",
    urgente: "nao",
    detalhes: "teste automatizado",
  });
  if (!answers.success) throw new Error(`answers failed: ${answers.error}`);

  const contact = await saveTriageContactAction(triageId, {
    name: "Alex Teste",
    email: "teste@example.com",
    phone: "11999999999",
  });
  if (!contact.success) throw new Error(`contact failed: ${contact.error}`);

  const docs = await skipDocumentsStepAction(triageId);
  if (!docs.success) throw new Error(`docs failed: ${docs.error}`);

  const lawyer = await skipLawyerStepAction(triageId);
  if (!lawyer.success) throw new Error(`lawyer failed: ${lawyer.error}`);

  const complete = await completeTriageAction(triageId, false);
  console.log("complete", complete);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
