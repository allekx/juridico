import { prisma } from "@/lib/prisma/client";

import { getClientDocuments } from "@/lib/documents/queries";

import type { ClientFolderAction } from "@prisma/client";

import type {

  ClientFolderData,

  ClientFolderSummary,

} from "@/types/client-folder";



export async function getClientsForFolder(

  officeId: string,

  search?: string

): Promise<ClientFolderSummary[]> {

  const clients = await prisma.client.findMany({

    where: {

      officeId,

      deletedAt: null,

      ...(search && {

        OR: [

          { name: { contains: search, mode: "insensitive" } },

          { cpfCnpj: { contains: search, mode: "insensitive" } },

          { email: { contains: search, mode: "insensitive" } },

        ],

      }),

    },

    include: {

      assignedLawyer: { include: { user: { select: { name: true } } } },

      _count: {

        select: {

          contracts: { where: { deletedAt: null } },

          messages: { where: { deletedAt: null } },

          documents: {

            where: { deletedAt: null, isTemplate: false, isLatestVersion: true },

          },

        },

      },

      documents: {

        where: { deletedAt: null, isTemplate: false, isLatestVersion: true },

        select: { documentType: true },

      },

    },

    orderBy: { name: "asc" },

    take: 100,

  });



  return clients.map((c) => ({

    id: c.id,

    name: c.name,

    type: c.type,

    cpfCnpj: c.cpfCnpj,

    email: c.email,

    phone: c.phone,

    lawyerName: c.assignedLawyer?.user.name ?? null,

    documentCount: c._count.documents,

    contractCount: c._count.contracts,

    powerOfAttorneyCount: c.documents.filter(

      (d) => d.documentType === "POWER_OF_ATTORNEY"

    ).length,

    messageCount: c._count.messages,

  }));

}



export async function getClientFolder(

  officeId: string,

  clientId: string

): Promise<ClientFolderData | null> {

  const client = await prisma.client.findFirst({

    where: { id: clientId, officeId, deletedAt: null },

    include: {

      assignedLawyer: { include: { user: { select: { name: true } } } },

    },

  });



  if (!client) return null;



  const [documents, contracts, messages, history] = await Promise.all([

    getClientDocuments(officeId, clientId),

    prisma.contract.findMany({

      where: { clientId, officeId, deletedAt: null },

      include: { createdBy: { select: { name: true } } },

      orderBy: { createdAt: "desc" },

    }),

    prisma.clientMessage.findMany({

      where: { clientId, officeId, deletedAt: null },

      include: { author: { select: { name: true } } },

      orderBy: { createdAt: "desc" },

      take: 50,

    }),

    prisma.clientFolderEvent.findMany({

      where: { clientId, officeId },

      include: { actor: { select: { name: true } } },

      orderBy: { createdAt: "desc" },

      take: 100,

    }),

  ]);



  const powerOfAttorneys = documents.filter(

    (d) => d.documentType === "POWER_OF_ATTORNEY"

  );



  return {

    client: {

      id: client.id,

      name: client.name,

      type: client.type,

      cpfCnpj: client.cpfCnpj,

      email: client.email,

      phone: client.phone,

      lawyerName: client.assignedLawyer?.user.name ?? null,

    },

    documents,

    contracts: contracts.map((c) => ({

      id: c.id,

      title: c.title,

      status: c.status,

      type: c.type,

      value: c.value ? Number(c.value) : null,

      hasFile: Boolean(c.storagePath),

      signedAt: c.signedAt?.toISOString() ?? null,

      createdByName: c.createdBy.name,

      createdAt: c.createdAt.toISOString(),

    })),

    powerOfAttorneys,

    messages: messages.map((m) => ({

      id: m.id,

      subject: m.subject,

      body: m.body,

      authorName: m.author.name,

      createdAt: m.createdAt.toISOString(),

    })),

    history: history.map((e) => ({

      id: e.id,

      action: e.action,

      description: e.description,

      actorName: e.actor.name,

      entityType: e.entityType,

      createdAt: e.createdAt.toISOString(),

    })),

  };

}



export async function logFolderEvent(

  officeId: string,

  clientId: string,

  actorId: string,

  action: ClientFolderAction,

  entityType: string,

  description: string,

  entityId?: string

) {

  await prisma.clientFolderEvent.create({

    data: {

      officeId,

      clientId,

      actorId,

      action,

      entityType,

      entityId,

      description,

    },

  });

}

