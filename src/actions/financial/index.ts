"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import {
  contractSchema,
  generateInstallmentsSchema,
  installmentSchema,
  markPaidSchema,
  paymentSchema,
} from "@/schemas/financial";
import type { ActionResult } from "@/types/auth";

function revalidateFinancial() {
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
}

async function nextInvoiceNumber(officeId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.payment.count({
    where: { officeId, invoiceNumber: { startsWith: `NF-${year}-` } },
  });
  return `NF-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createContractAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("financeiro:write");

  const parsed = contractSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    type: formData.get("type"),
    status: formData.get("status") || "DRAFT",
    clientId: formData.get("clientId"),
    caseId: formData.get("caseId") || "",
    value: formData.get("value") || undefined,
    signedAt: formData.get("signedAt") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;

  try {
    const contract = await prisma.contract.create({
      data: {
        officeId: user.officeId,
        createdById: user.id,
        title: data.title,
        content: data.content,
        type: data.type,
        status: data.status,
        clientId: data.clientId,
        caseId: data.caseId || null,
        value: data.value ?? null,
        signedAt: data.signedAt
          ? new Date(`${data.signedAt}T12:00:00`)
          : null,
        expiresAt: data.expiresAt
          ? new Date(`${data.expiresAt}T12:00:00`)
          : null,
      },
    });

    revalidateFinancial();
    return { success: true, data: { id: contract.id } };
  } catch {
    return { success: false, error: "Erro ao criar contrato" };
  }
}

export async function updateContractAction(
  contractId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("financeiro:write");

  const parsed = contractSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    type: formData.get("type"),
    status: formData.get("status"),
    clientId: formData.get("clientId"),
    caseId: formData.get("caseId") || "",
    value: formData.get("value") || undefined,
    signedAt: formData.get("signedAt") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;

  try {
    await prisma.contract.updateMany({
      where: { id: contractId, officeId: user.officeId, deletedAt: null },
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        status: data.status,
        clientId: data.clientId,
        caseId: data.caseId || null,
        value: data.value ?? null,
        signedAt: data.signedAt
          ? new Date(`${data.signedAt}T12:00:00`)
          : null,
        expiresAt: data.expiresAt
          ? new Date(`${data.expiresAt}T12:00:00`)
          : null,
      },
    });

    revalidateFinancial();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar contrato" };
  }
}

export async function generateInstallmentsAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ count: number }>> {
  const user = await withPermission("financeiro:write");

  const parsed = generateInstallmentsSchema.safeParse({
    contractId: formData.get("contractId"),
    count: formData.get("count"),
    firstDueDate: formData.get("firstDueDate"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const { contractId, count, firstDueDate } = parsed.data;

  try {
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, officeId: user.officeId, deletedAt: null },
    });

    if (!contract?.value) {
      return {
        success: false,
        error: "Contrato sem valor definido para gerar parcelas",
      };
    }

    const existing = await prisma.installment.count({
      where: { contractId, deletedAt: null },
    });

    if (existing > 0) {
      return {
        success: false,
        error: "Este contrato já possui parcelas. Exclua-as antes de gerar novas.",
      };
    }

    const total = contract.value.toNumber();
    const baseAmount = Math.floor((total / count) * 100) / 100;
    const remainder = Math.round((total - baseAmount * count) * 100) / 100;
    const firstDate = new Date(`${firstDueDate}T12:00:00`);

    const installments = Array.from({ length: count }, (_, i) => {
      const dueDate = new Date(firstDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      const amount = i === count - 1 ? baseAmount + remainder : baseAmount;

      return {
        officeId: user.officeId,
        clientId: contract.clientId,
        contractId,
        number: i + 1,
        amount,
        dueDate,
      };
    });

    await prisma.installment.createMany({ data: installments });

    revalidateFinancial();
    return { success: true, data: { count } };
  } catch {
    return { success: false, error: "Erro ao gerar parcelas" };
  }
}

export async function createInstallmentAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("financeiro:write");

  const parsed = installmentSchema.safeParse({
    contractId: formData.get("contractId"),
    number: formData.get("number"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;

  try {
    const contract = await prisma.contract.findFirst({
      where: { id: data.contractId, officeId: user.officeId, deletedAt: null },
    });

    if (!contract) {
      return { success: false, error: "Contrato não encontrado" };
    }

    const installment = await prisma.installment.create({
      data: {
        officeId: user.officeId,
        clientId: contract.clientId,
        contractId: data.contractId,
        number: data.number,
        amount: data.amount,
        dueDate: new Date(`${data.dueDate}T12:00:00`),
        notes: data.notes?.trim() || null,
      },
    });

    revalidateFinancial();
    return { success: true, data: { id: installment.id } };
  } catch {
    return { success: false, error: "Erro ao criar parcela" };
  }
}

export async function markInstallmentPaidAction(
  installmentId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("financeiro:write");

  const parsed = markPaidSchema.safeParse({
    paidAt: formData.get("paidAt") || undefined,
    method: formData.get("method") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const paidAt = parsed.data.paidAt
    ? new Date(`${parsed.data.paidAt}T12:00:00`)
    : new Date();

  try {
    const installment = await prisma.installment.findFirst({
      where: { id: installmentId, officeId: user.officeId, deletedAt: null },
      include: { receipt: true },
    });

    if (!installment) {
      return { success: false, error: "Parcela não encontrada" };
    }

    if (installment.status === "PAID") {
      return { success: false, error: "Parcela já está paga" };
    }

    const invoiceNumber = await nextInvoiceNumber(user.officeId);

    await prisma.$transaction(async (tx) => {
      if (installment.receipt) {
        await tx.payment.update({
          where: { id: installment.receipt.id },
          data: {
            status: "PAID",
            paidAt,
            method: parsed.data.method ?? installment.receipt.method,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            officeId: user.officeId,
            clientId: installment.clientId,
            contractId: installment.contractId,
            installmentId: installment.id,
            invoiceNumber,
            description: `Parcela ${installment.number}`,
            amount: installment.amount,
            direction: "RECEIPT",
            status: "PAID",
            method: parsed.data.method ?? "PIX",
            dueDate: installment.dueDate,
            paidAt,
          },
        });
      }

      await tx.installment.update({
        where: { id: installmentId },
        data: { status: "PAID", paidAt },
      });
    });

    revalidateFinancial();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao registrar pagamento da parcela" };
  }
}

export async function createPaymentAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("financeiro:write");

  const parsed = paymentSchema.safeParse({
    clientId: formData.get("clientId"),
    direction: formData.get("direction"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "PENDING",
    method: formData.get("method") || undefined,
    dueDate: formData.get("dueDate"),
    paidAt: formData.get("paidAt") || undefined,
    caseId: formData.get("caseId") || "",
    contractId: formData.get("contractId") || "",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;
  const isPaid = data.status === "PAID";
  const invoiceNumber =
    data.direction === "RECEIPT" ? await nextInvoiceNumber(user.officeId) : null;

  try {
    const payment = await prisma.payment.create({
      data: {
        officeId: user.officeId,
        clientId: data.clientId,
        caseId: data.caseId || null,
        contractId: data.contractId || null,
        invoiceNumber,
        description: data.description?.trim() || null,
        amount: data.amount,
        direction: data.direction,
        status: data.status,
        method: data.method ?? null,
        dueDate: new Date(`${data.dueDate}T12:00:00`),
        paidAt: isPaid
          ? data.paidAt
            ? new Date(`${data.paidAt}T12:00:00`)
            : new Date()
          : null,
        notes: data.notes?.trim() || null,
      },
    });

    revalidateFinancial();
    return { success: true, data: { id: payment.id } };
  } catch {
    return { success: false, error: "Erro ao registrar lançamento" };
  }
}

export async function markPaymentPaidAction(
  paymentId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("financeiro:write");

  const parsed = markPaidSchema.safeParse({
    paidAt: formData.get("paidAt") || undefined,
    method: formData.get("method") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const paidAt = parsed.data.paidAt
    ? new Date(`${parsed.data.paidAt}T12:00:00`)
    : new Date();

  try {
    await prisma.payment.updateMany({
      where: {
        id: paymentId,
        officeId: user.officeId,
        deletedAt: null,
        status: { not: "PAID" },
      },
      data: {
        status: "PAID",
        paidAt,
        ...(parsed.data.method ? { method: parsed.data.method } : {}),
      },
    });

    revalidateFinancial();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao marcar como pago" };
  }
}

export async function deleteContractAction(
  contractId: string
): Promise<ActionResult> {
  const user = await withPermission("financeiro:write");

  try {
    await prisma.contract.updateMany({
      where: { id: contractId, officeId: user.officeId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    revalidateFinancial();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir contrato" };
  }
}
