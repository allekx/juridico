import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { LEGAL_DOCUMENT_TEMPLATES } from "../src/lib/lgpd/templates";
import { hashContent } from "../src/lib/lgpd/hash";

const prisma = new PrismaClient();

const PORTAL_DEMO_PASSWORD =
  process.env.CLIENT_PORTAL_DEMO_PASSWORD ?? "Cliente@123";

function cpfToPortalEmail(cpfCnpj: string): string {
  return `${cpfCnpj.replace(/\D/g, "")}@portal.client`;
}

async function seedPortalClientUser(
  officeId: string,
  userId: string,
  client: { id: string; name: string; cpfCnpj: string }
) {
  const email = cpfToPortalEmail(client.cpfCnpj);

  await prisma.user.upsert({
    where: { officeId_email: { officeId, email } },
    update: { name: client.name, role: "CLIENT" },
    create: {
      id: userId,
      officeId,
      email,
      name: client.name,
      role: "CLIENT",
    },
  });

  await prisma.client.update({
    where: { id: client.id },
    data: { userId },
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return { email, synced: false as const };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabase.auth.admin.createUser({
    id: userId,
    email,
    password: PORTAL_DEMO_PASSWORD,
    email_confirm: true,
    app_metadata: { role: "CLIENT", office_id: officeId },
    user_metadata: { name: client.name },
  });

  if (error && !error.message.toLowerCase().includes("already")) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email,
        password: PORTAL_DEMO_PASSWORD,
        email_confirm: true,
        app_metadata: { role: "CLIENT", office_id: officeId },
        user_metadata: { name: client.name },
      }
    );
    if (updateError) {
      console.warn(`Portal: falha ao sincronizar ${email}:`, updateError.message);
      return { email, synced: false as const };
    }
  }

  return { email, synced: true as const };
}

async function main() {
  const office = await prisma.office.upsert({
    where: { slug: "almeida-associados" },
    update: {},
    create: {
      name: "Almeida & Associados",
      slug: "almeida-associados",
      email: "contato@almeidaassociados.com.br",
      phone: "(11) 3456-7890",
      city: "São Paulo",
      state: "SP",
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      officeId_email: {
        officeId: office.id,
        email: "admin@almeidaassociados.com.br",
      },
    },
    update: {},
    create: {
      id: "00000000-0000-4000-a000-000000000001",
      officeId: office.id,
      email: "admin@almeidaassociados.com.br",
      name: "Administrador",
      role: "ADMIN",
    },
  });

  const categories = await Promise.all(
    [
      { name: "Direito Trabalhista", slug: "trabalhista", description: "Artigos sobre relações de trabalho" },
      { name: "Direito de Família", slug: "familia", description: "Divórcio, guarda, pensão e sucessões" },
      { name: "Direito Empresarial", slug: "empresarial", description: "Empresas, contratos e compliance" },
    ].map((cat) =>
      prisma.blogCategory.upsert({
        where: {
          officeId_slug: { officeId: office.id, slug: cat.slug },
        },
        update: {},
        create: { officeId: office.id, ...cat },
      })
    )
  );

  const tags = await Promise.all(
    ["reforma-trabalhista", "divorcio", "contratos", "lgpd", "previdencia"].map(
      (slug) =>
        prisma.blogTag.upsert({
          where: {
            officeId_slug: { officeId: office.id, slug },
          },
          update: {},
          create: {
            officeId: office.id,
            name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            slug,
          },
        })
    )
  );

  const post = await prisma.blogPost.upsert({
    where: {
      officeId_slug: {
        officeId: office.id,
        slug: "reforma-trabalhista-o-que-muda",
      },
    },
    update: {},
    create: {
      officeId: office.id,
      authorId: admin.id,
      categoryId: categories[0].id,
      title: "Reforma Trabalhista: o que muda para empresas e trabalhadores",
      slug: "reforma-trabalhista-o-que-muda",
      excerpt:
        "Entenda as principais alterações da legislação trabalhista e como se preparar.",
      content: `A reforma trabalhista trouxe mudanças significativas nas relações de emprego no Brasil.

Entre os principais pontos estão a prevalência do negociado sobre o legislado, novas modalidades de contratação e alterações nos procedimentos de rescisão.

Empresas e trabalhadores devem revisar contratos, políticas internas e procedimentos de RH para garantir conformidade com a legislação vigente.

Consulte um advogado trabalhista para análise personalizada da sua situação.`,
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "Reforma Trabalhista: guia completo",
      metaDescription:
        "Principais mudanças da reforma trabalhista para empresas e empregados.",
      readingTime: 4,
    },
  });

  await prisma.blogPostTag.upsert({
    where: {
      postId_tagId: { postId: post.id, tagId: tags[0].id },
    },
    update: {},
    create: { postId: post.id, tagId: tags[0].id },
  });

  const lawyersData = [
    {
      id: "00000000-0000-4000-a000-000000000010",
      email: "carla.mendes@almeidaassociados.com.br",
      name: "Dra. Carla Mendes",
      oabNumber: "123456",
      oabState: "SP",
      specialty: "Direito Trabalhista e Previdenciário",
      bio: "Especialista em rescisões, assédio moral e benefícios previdenciários.",
      isPartner: true,
      displayOrder: 1,
    },
    {
      id: "00000000-0000-4000-a000-000000000011",
      email: "roberto.silva@almeidaassociados.com.br",
      name: "Dr. Roberto Silva",
      oabNumber: "234567",
      oabState: "SP",
      specialty: "Direito de Família e Sucessões",
      bio: "Atuação em divórcio, guarda, pensão alimentícia e inventários.",
      isPartner: true,
      displayOrder: 2,
    },
    {
      id: "00000000-0000-4000-a000-000000000012",
      email: "ana.costa@almeidaassociados.com.br",
      name: "Dra. Ana Costa",
      oabNumber: "345678",
      oabState: "SP",
      specialty: "Direito Empresarial e Societário",
      bio: "Consultoria para empresas, contratos e reestruturações societárias.",
      isPartner: false,
      displayOrder: 3,
    },
    {
      id: "00000000-0000-4000-a000-000000000013",
      email: "pedro.oliveira@almeidaassociados.com.br",
      name: "Dr. Pedro Oliveira",
      oabNumber: "456789",
      oabState: "SP",
      specialty: "Direito Criminal e Penal",
      bio: "Defesa em inquéritos, ações penais e habeas corpus.",
      isPartner: false,
      displayOrder: 4,
    },
    {
      id: "00000000-0000-4000-a000-000000000014",
      email: "julia.santos@almeidaassociados.com.br",
      name: "Dra. Júlia Santos",
      oabNumber: "567890",
      oabState: "SP",
      specialty: "Direito do Consumidor e Cível",
      bio: "Indenizações, contratos de consumo e responsabilidade civil.",
      isPartner: false,
      displayOrder: 5,
    },
    {
      id: "00000000-0000-4000-a000-000000000015",
      email: "marcos.ferreira@almeidaassociados.com.br",
      name: "Dr. Marcos Ferreira",
      oabNumber: "678901",
      oabState: "SP",
      specialty: "Direito Tributário e Fiscal",
      bio: "Planejamento tributário, defesas administrativas e contencioso fiscal.",
      isPartner: false,
      displayOrder: 6,
    },
    {
      id: "00000000-0000-4000-a000-000000000016",
      email: "luciana.alves@almeidaassociados.com.br",
      name: "Dra. Luciana Alves",
      oabNumber: "789012",
      oabState: "SP",
      specialty: "Direito Imobiliário",
      bio: "Contratos de compra e venda, locação e regularização fundiária.",
      isPartner: false,
      displayOrder: 7,
    },
  ] as const;

  for (const lawyer of lawyersData) {
    const user = await prisma.user.upsert({
      where: {
        officeId_email: {
          officeId: office.id,
          email: lawyer.email,
        },
      },
      update: { name: lawyer.name },
      create: {
        id: lawyer.id,
        officeId: office.id,
        email: lawyer.email,
        name: lawyer.name,
        role: "LAWYER",
      },
    });

    await prisma.lawyer.upsert({
      where: { userId: user.id },
      update: {
        specialty: lawyer.specialty,
        bio: lawyer.bio,
        isPartner: lawyer.isPartner,
        displayOrder: lawyer.displayOrder,
        isPublic: true,
      },
      create: {
        officeId: office.id,
        userId: user.id,
        oabNumber: lawyer.oabNumber,
        oabState: lawyer.oabState,
        specialty: lawyer.specialty,
        bio: lawyer.bio,
        isPartner: lawyer.isPartner,
        displayOrder: lawyer.displayOrder,
        isPublic: true,
      },
    });
  }

  const caseStatuses = await Promise.all(
    [
      { name: "Novo", slug: "novo", color: "#3B82F6", sortOrder: 1, isDefault: true },
      { name: "Triagem", slug: "triagem", color: "#8B5CF6", sortOrder: 2 },
      { name: "Aguardando Documentos", slug: "aguardando-documentos", color: "#F59E0B", sortOrder: 3 },
      { name: "Em Análise", slug: "em-analise", color: "#06B6D4", sortOrder: 4 },
      { name: "Em Atendimento", slug: "em-atendimento", color: "#10B981", sortOrder: 5 },
      { name: "Processo Protocolado", slug: "processo-protocolado", color: "#6366F1", sortOrder: 6 },
      { name: "Finalizado", slug: "finalizado", color: "#22C55E", sortOrder: 7, isFinal: true },
      { name: "Arquivado", slug: "arquivado", color: "#6B7280", sortOrder: 8, isFinal: true },
    ].map((s) =>
      prisma.caseStatus.upsert({
        where: {
          officeId_slug: { officeId: office.id, slug: s.slug },
        },
        update: {
          name: s.name,
          color: s.color,
          sortOrder: s.sortOrder,
          isFinal: s.isFinal ?? false,
          isDefault: s.isDefault ?? false,
        },
        create: {
          officeId: office.id,
          name: s.name,
          slug: s.slug,
          color: s.color,
          sortOrder: s.sortOrder,
          isDefault: s.isDefault ?? false,
          isFinal: s.isFinal ?? false,
        },
      })
    )
  );

  const statusBySlug = Object.fromEntries(caseStatuses.map((s) => [s.slug, s]));

  const carlaUserId = "00000000-0000-4000-a000-000000000010";
  const robertoUserId = "00000000-0000-4000-a000-000000000011";
  const carlaLawyer = await prisma.lawyer.findFirst({
    where: { userId: carlaUserId },
  });
  const robertoLawyer = await prisma.lawyer.findFirst({
    where: { userId: robertoUserId },
  });

  const clients = await Promise.all(
    [
      {
        name: "Maria Silva Santos",
        type: "INDIVIDUAL" as const,
        cpfCnpj: "123.456.789-00",
        email: "maria.silva@email.com",
        phone: "(11) 98765-4321",
        city: "São Paulo",
        state: "SP",
        lawyerId: carlaLawyer?.id,
      },
      {
        name: "Tech Solutions Ltda",
        type: "COMPANY" as const,
        cpfCnpj: "12.345.678/0001-90",
        email: "juridico@techsolutions.com.br",
        phone: "(11) 3456-7890",
        city: "São Paulo",
        state: "SP",
        lawyerId: robertoLawyer?.id,
      },
      {
        name: "João Pereira Oliveira",
        type: "INDIVIDUAL" as const,
        cpfCnpj: "987.654.321-00",
        email: "joao.pereira@email.com",
        phone: "(11) 91234-5678",
        city: "Campinas",
        state: "SP",
        lawyerId: carlaLawyer?.id,
      },
    ].map((c) =>
      prisma.client.upsert({
        where: {
          officeId_cpfCnpj: { officeId: office.id, cpfCnpj: c.cpfCnpj },
        },
        update: { name: c.name },
        create: {
          officeId: office.id,
          assignedLawyerId: c.lawyerId ?? null,
          type: c.type,
          name: c.name,
          cpfCnpj: c.cpfCnpj,
          email: c.email,
          phone: c.phone,
          city: c.city,
          state: c.state,
        },
      })
    )
  );

  await Promise.all(
    [
      {
        name: "Fernanda Costa",
        email: "fernanda.costa@email.com",
        phone: "(11) 99876-5432",
        source: "TRIAGE" as const,
        status: "NEW" as const,
        interestArea: "Direito Trabalhista",
        assignedToId: carlaUserId,
      },
      {
        name: "Ricardo Almeida",
        email: "ricardo.almeida@email.com",
        phone: "(11) 97654-3210",
        source: "WEBSITE" as const,
        status: "CONTACTED" as const,
        interestArea: "Direito de Família",
        assignedToId: robertoUserId,
      },
      {
        name: "Empresa ABC Comércio",
        email: "contato@abccomercio.com.br",
        phone: "(11) 3344-5566",
        source: "REFERRAL" as const,
        status: "QUALIFIED" as const,
        interestArea: "Direito Empresarial",
        assignedToId: "00000000-0000-4000-a000-000000000012",
      },
      {
        name: "Patrícia Mendes",
        phone: "(11) 96543-2109",
        source: "PHONE" as const,
        status: "PROPOSAL" as const,
        interestArea: "Direito do Consumidor",
        assignedToId: "00000000-0000-4000-a000-000000000014",
      },
      {
        name: "Carlos Eduardo",
        email: "carlos.eduardo@email.com",
        phone: "(11) 95432-1098",
        source: "WALK_IN" as const,
        status: "NEGOTIATION" as const,
        interestArea: "Direito Imobiliário",
        assignedToId: "00000000-0000-4000-a000-000000000016",
      },
    ].map((lead, i) =>
      prisma.lead.upsert({
        where: { id: `00000000-0000-4000-b000-00000000000${i + 1}` },
        update: { status: lead.status },
        create: {
          id: `00000000-0000-4000-b000-00000000000${i + 1}`,
          officeId: office.id,
          assignedToId: lead.assignedToId,
          name: lead.name,
          email: lead.email ?? null,
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          interestArea: lead.interestArea,
          notes: "Lead de exemplo para demonstração do CRM.",
        },
      })
    )
  );

  const casesData = [
    {
      id: "00000000-0000-4000-d000-000000000001",
      clientId: clients[0].id,
      lawyerId: carlaUserId,
      statusSlug: "em-atendimento",
      caseNumber: "1001234-56.2024.5.02.0001",
      caseType: "Trabalhista",
      title: "Rescisão indireta — Maria Silva",
      priority: "HIGH" as const,
      court: "TRT-2",
    },
    {
      id: "00000000-0000-4000-d000-000000000002",
      clientId: clients[1].id,
      lawyerId: robertoUserId,
      statusSlug: "em-analise",
      caseNumber: "0001234-12.2024.8.26.0100",
      caseType: "Societário",
      title: "Reestruturação societária — Tech Solutions",
      priority: "MEDIUM" as const,
      court: "TJSP",
    },
    {
      id: "00000000-0000-4000-d000-000000000003",
      clientId: clients[2].id,
      lawyerId: carlaUserId,
      statusSlug: "aguardando-documentos",
      caseNumber: "SEED-PREV-001",
      caseType: "Previdenciário",
      title: "Revisão de benefício — João Pereira",
      priority: "URGENT" as const,
      court: "JF-SP",
    },
    {
      id: "00000000-0000-4000-d000-000000000005",
      clientId: clients[0].id,
      lawyerId: carlaUserId,
      statusSlug: "novo",
      caseNumber: "SEED-NOVO-001",
      caseType: "Trabalhista",
      title: "Assédio moral — consulta inicial",
      priority: "MEDIUM" as const,
      court: "TRT-2",
    },
    {
      id: "00000000-0000-4000-d000-000000000006",
      clientId: clients[1].id,
      lawyerId: robertoUserId,
      statusSlug: "triagem",
      caseNumber: "SEED-TRIAGEM-001",
      caseType: "Empresarial",
      title: "Due diligence — aquisição",
      priority: "HIGH" as const,
    },
    {
      id: "00000000-0000-4000-d000-000000000007",
      clientId: clients[2].id,
      lawyerId: carlaUserId,
      statusSlug: "processo-protocolado",
      caseNumber: "2009876-12.2024.5.02.0003",
      caseType: "Previdenciário",
      title: "Aposentadoria especial — João Pereira",
      priority: "MEDIUM" as const,
      court: "JF-SP",
    },
  ] as const;

  const cases = await Promise.all(
    casesData.map((c) => {
      const status = statusBySlug[c.statusSlug];
      return prisma.case.upsert({
        where: { id: c.id },
        update: { title: c.title, statusId: status.id },
        create: {
          id: c.id,
          officeId: office.id,
          clientId: c.clientId,
          lawyerId: c.lawyerId,
          statusId: status.id,
          caseNumber: c.caseNumber,
          caseType: c.caseType,
          title: c.title,
          priority: c.priority,
          court: c.court ?? null,
          description: "Caso de exemplo para demonstração do Kanban.",
        },
      });
    })
  );

  const historyIds = [
    "00000000-0000-4000-c000-000000000001",
    "00000000-0000-4000-c000-000000000002",
    "00000000-0000-4000-c000-000000000003",
  ];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    await prisma.caseHistory.upsert({
      where: { id: historyIds[i] },
      update: {},
      create: {
        id: historyIds[i],
        caseId: c.id,
        statusId: c.statusId,
        changedById: c.lawyerId,
        notes: "Caso aberto no sistema.",
      },
    });
  }

  const mariaCaseId = "00000000-0000-4000-d000-000000000001";
  const mariaProgressHistory = [
    {
      id: "00000000-0000-4000-c000-000000000101",
      statusSlug: "novo",
      daysAgo: 90,
      notes: "Cadastro recebido no escritório.",
    },
    {
      id: "00000000-0000-4000-c000-000000000102",
      statusSlug: "aguardando-documentos",
      daysAgo: 75,
      notes: "Documentos recebidos do cliente.",
    },
    {
      id: "00000000-0000-4000-c000-000000000103",
      statusSlug: "em-analise",
      daysAgo: 45,
      notes: "Análise jurídica iniciada.",
    },
    {
      id: "00000000-0000-4000-c000-000000000104",
      statusSlug: "processo-protocolado",
      daysAgo: 20,
      notes: "Petição inicial protocolada no TRT-2.",
    },
    {
      id: "00000000-0000-4000-c000-000000000105",
      statusSlug: "em-atendimento",
      daysAgo: 5,
      notes: "Audiência de conciliação marcada.",
    },
  ] as const;

  for (const entry of mariaProgressHistory) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - entry.daysAgo);

    await prisma.caseHistory.upsert({
      where: { id: entry.id },
      update: { createdAt },
      create: {
        id: entry.id,
        caseId: mariaCaseId,
        statusId: statusBySlug[entry.statusSlug].id,
        changedById: carlaUserId,
        notes: entry.notes,
        createdAt,
      },
    });
  }

  function agendaSlot(daysFromNow: number, hour: number, durationMin = 60) {
    const start = new Date();
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + durationMin * 60 * 1000);
    return { start, end };
  }

  const agendaEvents = [
    {
      id: "00000000-0000-4000-g000-000000000001",
      title: "Audiência de conciliação — TRT-2",
      type: "HEARING" as const,
      ...agendaSlot(3, 10),
      caseId: mariaCaseId,
      clientId: clients[0].id,
      lawyerId: carlaUserId,
      location: "TRT-2 — 1ª Vara do Trabalho",
      notifyEnabled: true,
      notifyMinutesBefore: 1440,
    },
    {
      id: "00000000-0000-4000-g000-000000000002",
      title: "Reunião com cliente — Tech Solutions",
      type: "MEETING" as const,
      ...agendaSlot(1, 14),
      caseId: cases[1]?.id,
      clientId: clients[1].id,
      lawyerId: robertoUserId,
      location: "Sala de reuniões — escritório",
      notifyEnabled: true,
      notifyMinutesBefore: 30,
    },
    {
      id: "00000000-0000-4000-g000-000000000003",
      title: "Prazo para contestação",
      type: "DEADLINE" as const,
      ...agendaSlot(5, 18, 30),
      caseId: cases[2]?.id,
      clientId: clients[2].id,
      lawyerId: carlaUserId,
      location: "Protocolo eletrônico PJe",
      notifyEnabled: true,
      notifyMinutesBefore: 2880,
    },
    {
      id: "00000000-0000-4000-g000-000000000004",
      title: "Retorno — João Pereira (benefício)",
      type: "RETURN" as const,
      ...agendaSlot(2, 9),
      clientId: clients[2].id,
      lawyerId: carlaUserId,
      location: "Telefone / WhatsApp",
      notifyEnabled: false,
      notifyMinutesBefore: null,
    },
    {
      id: "00000000-0000-4000-g000-000000000005",
      title: "Reunião interna — estratégia processual",
      type: "MEETING" as const,
      ...agendaSlot(0, 11),
      lawyerId: carlaUserId,
      location: "Escritório",
      notifyEnabled: false,
      notifyMinutesBefore: null,
    },
  ];

  for (const ev of agendaEvents) {
    const reminderAt =
      ev.notifyEnabled && ev.notifyMinutesBefore
        ? new Date(ev.start.getTime() - ev.notifyMinutesBefore * 60 * 1000)
        : null;

    await prisma.appointment.upsert({
      where: { id: ev.id },
      update: {
        startAt: ev.start,
        endAt: ev.end,
        notifyEnabled: ev.notifyEnabled,
        notifyMinutesBefore: ev.notifyMinutesBefore,
        reminderAt,
      },
      create: {
        id: ev.id,
        officeId: office.id,
        caseId: ev.caseId ?? null,
        clientId: ev.clientId ?? null,
        lawyerId: ev.lawyerId,
        createdById: ev.lawyerId,
        title: ev.title,
        type: ev.type,
        status: "SCHEDULED",
        location: ev.location,
        startAt: ev.start,
        endAt: ev.end,
        notifyEnabled: ev.notifyEnabled,
        notifyMinutesBefore: ev.notifyMinutesBefore,
        reminderAt,
      },
    });
  }

  await prisma.case.upsert({
    where: { id: "00000000-0000-4000-d000-000000000004" },
    update: {
      statusId: statusBySlug["finalizado"].id,
      closedAt: new Date("2025-11-15"),
    },
    create: {
      id: "00000000-0000-4000-d000-000000000004",
      officeId: office.id,
      clientId: clients[0].id,
      lawyerId: carlaUserId,
      statusId: statusBySlug["finalizado"].id,
      caseNumber: "0509876-43.2023.5.02.0001",
      caseType: "Trabalhista",
      title: "Horas extras — acordo homologado",
      priority: "LOW",
      court: "TRT-2",
      closedAt: new Date("2025-11-15"),
      description: "Caso finalizado com acordo homologado.",
    },
  });

  await prisma.case.upsert({
    where: { id: "00000000-0000-4000-d000-000000000008" },
    update: { statusId: statusBySlug["arquivado"].id },
    create: {
      id: "00000000-0000-4000-d000-000000000008",
      officeId: office.id,
      clientId: clients[1].id,
      lawyerId: robertoUserId,
      statusId: statusBySlug["arquivado"].id,
      caseNumber: "ARQ-2019-0042",
      caseType: "Cível",
      title: "Cobrança extrajudicial — arquivo",
      priority: "LOW",
      closedAt: new Date("2024-06-01"),
      description: "Caso arquivado por acordo extrajudicial.",
    },
  });

  const adminUserId = "00000000-0000-4000-a000-000000000001";

  await Promise.all(
    [
      {
        id: "00000000-0000-4000-e000-000000000001",
        name: "Contrato de trabalho.pdf",
        caseId: cases[0].id,
        clientId: clients[0].id,
        documentType: "CONTRACT" as const,
        visibility: "CLIENT" as const,
      },
      {
        id: "00000000-0000-4000-e000-000000000002",
        name: "Petição inicial.docx",
        caseId: cases[0].id,
        clientId: clients[0].id,
        documentType: "PETITION" as const,
        visibility: "INTERNAL" as const,
      },
      {
        id: "00000000-0000-4000-e000-000000000003",
        name: "Contrato social.pdf",
        caseId: cases[1].id,
        clientId: clients[1].id,
        documentType: "CONTRACT" as const,
        visibility: "INTERNAL" as const,
      },
      {
        id: "00000000-0000-4000-e000-000000000004",
        name: "Procuração ad judicia.pdf",
        caseId: cases[2].id,
        clientId: clients[2].id,
        documentType: "POWER_OF_ATTORNEY" as const,
        visibility: "CLIENT" as const,
      },
      {
        id: "00000000-0000-4000-e000-000000000005",
        name: "Comprovante de residência.jpg",
        clientId: clients[0].id,
        documentType: "RECEIPT" as const,
        visibility: "CLIENT" as const,
      },
      {
        id: "00000000-0000-4000-e000-000000000006",
        name: "RG - Maria Silva.pdf",
        clientId: clients[0].id,
        documentType: "RG" as const,
        visibility: "CLIENT" as const,
      },
      {
        id: "00000000-0000-4000-e000-000000000007",
        name: "CPF - Maria Silva.pdf",
        clientId: clients[0].id,
        documentType: "CPF" as const,
        visibility: "CLIENT" as const,
      },
    ].map((doc) =>
      prisma.document.upsert({
        where: { id: doc.id },
        update: {
          visibility: doc.visibility,
          documentType: doc.documentType,
          documentGroupId: doc.id,
          isLatestVersion: true,
          version: doc.id === "00000000-0000-4000-e000-000000000006" ? 2 : 1,
        },
        create: {
          id: doc.id,
          officeId: office.id,
          caseId: doc.caseId ?? null,
          clientId: doc.clientId,
          uploadedById: adminUserId,
          name: doc.name,
          documentType: doc.documentType,
          documentGroupId: doc.id,
          version: doc.id === "00000000-0000-4000-e000-000000000006" ? 2 : 1,
          isLatestVersion: true,
          visibility: doc.visibility,
          storagePath: `seed/${doc.id}/${doc.name}`,
          mimeType: doc.name.endsWith(".pdf")
            ? "application/pdf"
            : doc.name.endsWith(".docx")
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : "image/jpeg",
          fileSize: 102400,
        },
      })
    )
  );

  await prisma.document.upsert({
    where: { id: "00000000-0000-4000-e000-000000000008" },
    update: { isLatestVersion: false },
    create: {
      id: "00000000-0000-4000-e000-000000000008",
      officeId: office.id,
      clientId: clients[0].id,
      uploadedById: adminUserId,
      name: "RG - Maria Silva (antigo).pdf",
      documentType: "RG",
      documentGroupId: "00000000-0000-4000-e000-000000000006",
      version: 1,
      isLatestVersion: false,
      visibility: "CLIENT",
      storagePath: "seed/rg-maria-v1.pdf",
      mimeType: "application/pdf",
      fileSize: 88000,
    },
  });

  const now = new Date();
  const paymentsData = [
    { id: "00000000-0000-4000-f000-000000000001", amount: 8500, monthsAgo: 5, clientId: clients[0].id, caseId: cases[0].id },
    { id: "00000000-0000-4000-f000-000000000002", amount: 12000, monthsAgo: 4, clientId: clients[1].id, caseId: cases[1].id },
    { id: "00000000-0000-4000-f000-000000000003", amount: 4500, monthsAgo: 3, clientId: clients[2].id, caseId: cases[2].id },
    { id: "00000000-0000-4000-f000-000000000004", amount: 15000, monthsAgo: 2, clientId: clients[1].id, caseId: cases[1].id },
    { id: "00000000-0000-4000-f000-000000000005", amount: 6200, monthsAgo: 1, clientId: clients[0].id, caseId: cases[0].id },
    { id: "00000000-0000-4000-f000-000000000006", amount: 9800, monthsAgo: 0, clientId: clients[2].id, caseId: cases[2].id },
    { id: "00000000-0000-4000-f000-000000000007", amount: 3500, monthsAgo: 0, clientId: clients[0].id, status: "PENDING" as const },
  ];

  for (const p of paymentsData) {
    const paidAt = new Date(now.getFullYear(), now.getMonth() - p.monthsAgo, 15);
    const dueDate = new Date(paidAt);
    dueDate.setDate(dueDate.getDate() - 5);

    await prisma.payment.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        officeId: office.id,
        clientId: p.clientId,
        caseId: p.caseId,
        invoiceNumber: `NF-2025-${p.id.slice(-3)}`,
        description: "Honorários advocatícios",
        amount: p.amount,
        direction: "RECEIPT",
        status: p.status ?? "PAID",
        method: "PIX",
        dueDate,
        paidAt: p.status === "PENDING" ? null : paidAt,
      },
    });
  }

  const expensesData = [
    {
      id: "00000000-0000-4000-f000-000000000010",
      amount: 1200,
      monthsAgo: 2,
      description: "Custas processuais — TJSP",
      clientId: clients[0].id,
      caseId: cases[0].id,
    },
    {
      id: "00000000-0000-4000-f000-000000000011",
      amount: 850,
      monthsAgo: 1,
      description: "Certidões e despachante",
      clientId: clients[1].id,
      caseId: cases[1].id,
    },
    {
      id: "00000000-0000-4000-f000-000000000012",
      amount: 450,
      monthsAgo: 0,
      description: "Taxa de publicação",
      clientId: clients[2].id,
      status: "PENDING" as const,
    },
  ];

  for (const e of expensesData) {
    const paidAt = new Date(now.getFullYear(), now.getMonth() - e.monthsAgo, 10);
    const dueDate = new Date(paidAt);

    await prisma.payment.upsert({
      where: { id: e.id },
      update: { direction: "EXPENSE" },
      create: {
        id: e.id,
        officeId: office.id,
        clientId: e.clientId,
        caseId: e.caseId ?? null,
        description: e.description,
        amount: e.amount,
        direction: "EXPENSE",
        status: e.status ?? "PAID",
        method: "BANK_TRANSFER",
        dueDate,
        paidAt: e.status === "PENDING" ? null : paidAt,
      },
    });
  }

  await prisma.contract.upsert({
    where: { id: "00000000-0000-4000-f100-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-f100-000000000001",
      officeId: office.id,
      clientId: clients[0].id,
      createdById: adminUserId,
      title: "Contrato de honorários advocatícios",
      content: "Contrato de prestação de serviços jurídicos.",
      type: "FEE_AGREEMENT",
      status: "SIGNED",
      value: 15000,
      signedAt: new Date("2025-01-10"),
      storagePath: `seed/contracts/honorarios-maria.pdf`,
    },
  });

  const contractMariaId = "00000000-0000-4000-f100-000000000001";
  const installmentsMaria = [
    {
      id: "00000000-0000-4000-f200-000000000010",
      number: 1,
      amount: 5000,
      monthsAgo: 3,
      status: "PAID" as const,
      receiptId: "00000000-0000-4000-f000-000000000020",
    },
    {
      id: "00000000-0000-4000-f200-000000000011",
      number: 2,
      amount: 5000,
      monthsAgo: 2,
      status: "PAID" as const,
      receiptId: "00000000-0000-4000-f000-000000000021",
    },
    {
      id: "00000000-0000-4000-f200-000000000012",
      number: 3,
      amount: 5000,
      monthsAgo: 1,
      status: "PENDING" as const,
    },
  ];

  for (const inst of installmentsMaria) {
    const dueDate = new Date(
      now.getFullYear(),
      now.getMonth() - inst.monthsAgo,
      10
    );
    const paidAt =
      inst.status === "PAID"
        ? new Date(now.getFullYear(), now.getMonth() - inst.monthsAgo + 2, 15)
        : null;

    await prisma.installment.upsert({
      where: { id: inst.id },
      update: {},
      create: {
        id: inst.id,
        officeId: office.id,
        clientId: clients[0].id,
        contractId: contractMariaId,
        number: inst.number,
        amount: inst.amount,
        dueDate,
        status: inst.status,
        paidAt,
      },
    });

    if (inst.receiptId && inst.status === "PAID") {
      await prisma.payment.upsert({
        where: { id: inst.receiptId },
        update: {},
        create: {
          id: inst.receiptId,
          officeId: office.id,
          clientId: clients[0].id,
          caseId: cases[0].id,
          contractId: contractMariaId,
          installmentId: inst.id,
          invoiceNumber: `NF-2025-P${inst.number}`,
          description: `Parcela ${inst.number} — honorários`,
          amount: inst.amount,
          direction: "RECEIPT",
          status: "PAID",
          method: "PIX",
          dueDate,
          paidAt,
        },
      });
    }
  }

  await prisma.clientMessage.upsert({
    where: { id: "00000000-0000-4000-f200-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-f200-000000000001",
      officeId: office.id,
      clientId: clients[0].id,
      authorId: carlaUserId,
      subject: "Documentos pendentes",
      body: "Por favor, envie os holerites dos últimos 12 meses para darmos continuidade ao processo.",
    },
  });

  await prisma.clientMessage.upsert({
    where: { id: "00000000-0000-4000-f200-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-4000-f200-000000000002",
      officeId: office.id,
      clientId: clients[1].id,
      authorId: robertoUserId,
      subject: "Reunião de alinhamento",
      body: "Confirmada reunião para quinta-feira às 14h para revisão do contrato social.",
    },
  });

  const folderEvents = [
    {
      id: "00000000-0000-4000-f300-000000000001",
      clientId: clients[0].id,
      actorId: adminUserId,
      action: "FILE_UPLOADED" as const,
      entityType: "document",
      description: "Documento enviado: Contrato de trabalho.pdf",
    },
    {
      id: "00000000-0000-4000-f300-000000000002",
      clientId: clients[0].id,
      actorId: carlaUserId,
      action: "CONTRACT_CREATED" as const,
      entityType: "contract",
      description: "Contrato criado: Contrato de honorários advocatícios",
    },
    {
      id: "00000000-0000-4000-f300-000000000003",
      clientId: clients[0].id,
      actorId: carlaUserId,
      action: "MESSAGE_SENT" as const,
      entityType: "message",
      description: "Documentos pendentes",
    },
  ];

  for (const event of folderEvents) {
    await prisma.clientFolderEvent.upsert({
      where: { id: event.id },
      update: {},
      create: { officeId: office.id, ...event },
    });
  }

  const tasksData = [
    {
      id: "00000000-0000-4000-h000-000000000001",
      title: "Solicitar holerites dos últimos 12 meses",
      description: "Cliente Maria Silva — processo trabalhista",
      status: "PENDING" as const,
      priority: "HIGH" as const,
      assignedToId: carlaUserId,
      clientId: clients[0].id,
      caseId: mariaCaseId,
      dueDays: 2,
    },
    {
      id: "00000000-0000-4000-h000-000000000002",
      title: "Revisar minuta do contrato social",
      status: "IN_PROGRESS" as const,
      priority: "MEDIUM" as const,
      assignedToId: robertoUserId,
      clientId: clients[1].id,
      caseId: cases[1]?.id,
      dueDays: 5,
    },
    {
      id: "00000000-0000-4000-h000-000000000003",
      title: "Protocolar petição inicial",
      status: "PENDING" as const,
      priority: "URGENT" as const,
      assignedToId: carlaUserId,
      clientId: clients[2].id,
      caseId: cases[2]?.id,
      dueDays: 1,
    },
    {
      id: "00000000-0000-4000-h000-000000000004",
      title: "Arquivar documentos do caso encerrado",
      status: "COMPLETED" as const,
      priority: "LOW" as const,
      assignedToId: carlaUserId,
      clientId: clients[0].id,
      dueDays: -7,
    },
    {
      id: "00000000-0000-4000-h000-000000000005",
      title: "Organizar pasta digital — Tech Solutions",
      status: "IN_PROGRESS" as const,
      priority: "MEDIUM" as const,
      assignedToId: "00000000-0000-4000-a000-000000000012",
      clientId: clients[1].id,
      dueDays: 4,
    },
  ];

  for (const t of tasksData) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + t.dueDays);

    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        status: t.status,
        dueDate,
      },
      create: {
        id: t.id,
        officeId: office.id,
        title: t.title,
        description: "description" in t ? t.description : null,
        status: t.status,
        priority: t.priority,
        assignedToId: t.assignedToId,
        createdById: adminUserId,
        clientId: t.clientId ?? null,
        caseId: t.caseId ?? null,
        dueDate,
        completedAt: t.status === "COMPLETED" ? new Date() : null,
      },
    });
  }

  const notificationSeeds = [
    {
      id: "00000000-0000-4000-n000-000000000001",
      userId: adminUserId,
      type: "INFO" as const,
      title: "Novo lead",
      body: "João Pereira — Triagem · Direito Trabalhista",
      link: "/dashboard/crm/leads",
      metadata: { event: "NEW_LEAD" },
      readAt: null as Date | null,
    },
    {
      id: "00000000-0000-4000-n000-000000000002",
      userId: carlaUserId,
      type: "INFO" as const,
      title: "Documento do cliente",
      body: "Maria Silva enviou RG: rg-maria.pdf",
      link: `/dashboard/documentos/${clients[0].id}?tab=documentos`,
      metadata: { event: "DOCUMENT_UPLOADED", clientId: clients[0].id },
      readAt: null,
    },
    {
      id: "00000000-0000-4000-n000-000000000003",
      userId: adminUserId,
      type: "WARNING" as const,
      title: "Status alterado",
      body: "Reclamação trabalhista (Maria Silva) → Em andamento · por Carla Mendes",
      link: "/dashboard/kanban",
      metadata: { event: "STATUS_CHANGED" },
      readAt: new Date(),
    },
    {
      id: "00000000-0000-4000-n000-000000000004",
      userId: carlaUserId,
      type: "DEADLINE" as const,
      title: "Prazo: Contestação trabalhista",
      body: "Compromisso em 10 jun, 14:00 — Prazo processual",
      link: "/dashboard/agenda",
      metadata: { event: "DEADLINE_NEAR" },
      readAt: null,
    },
    {
      id: "00000000-0000-4000-n000-000000000005",
      userId: adminUserId,
      type: "SUCCESS" as const,
      title: "Lead convertido",
      body: "Ana Costa convertida em cliente",
      link: "/dashboard/crm/leads",
      metadata: { event: "NEW_CLIENT" },
      readAt: null,
    },
  ];

  for (const n of notificationSeeds) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: {
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        metadata: n.metadata,
        readAt: n.readAt,
      },
    });
  }

  const legalDocSeeds = [
    {
      id: "00000000-0000-4000-l000-000000000001",
      type: "PRIVACY_POLICY" as const,
    },
    {
      id: "00000000-0000-4000-l000-000000000002",
      type: "TERMS_OF_USE" as const,
    },
  ];

  for (const doc of legalDocSeeds) {
    const template = LEGAL_DOCUMENT_TEMPLATES[doc.type];
    const content = template.content;

    await prisma.legalDocument.upsert({
      where: { id: doc.id },
      update: { isActive: true },
      create: {
        id: doc.id,
        officeId: office.id,
        type: doc.type,
        version: 1,
        title: template.title,
        summary: template.summary,
        content,
        contentHash: hashContent(content),
        isActive: true,
        publishedAt: new Date("2025-01-01"),
        createdById: adminUserId,
      },
    });
  }

  await prisma.consentRecord.upsert({
    where: { id: "00000000-0000-4000-l100-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-l100-000000000001",
      officeId: office.id,
      legalDocumentId: "00000000-0000-4000-l000-000000000001",
      subjectType: "VISITOR",
      subjectEmail: "visitante@exemplo.com",
      subjectName: "Visitante Exemplo",
      consentType: "PRIVACY_POLICY",
      granted: true,
      source: "cookie_banner",
      documentVersion: 1,
      documentHash: hashContent(LEGAL_DOCUMENT_TEMPLATES.PRIVACY_POLICY.content),
      ipAddress: "127.0.0.1",
    },
  });

  await prisma.consentRecord.upsert({
    where: { id: "00000000-0000-4000-l100-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-4000-l100-000000000002",
      officeId: office.id,
      legalDocumentId: "00000000-0000-4000-l000-000000000001",
      subjectType: "LEAD",
      subjectId: "00000000-0000-4000-b000-000000000001",
      subjectEmail: "fernanda.costa@email.com",
      subjectName: "Fernanda Costa",
      consentType: "DATA_PROCESSING",
      granted: true,
      source: "triage",
      documentVersion: 1,
      ipAddress: "201.10.20.5",
    },
  });

  await prisma.dataDeletionRequest.upsert({
    where: { id: "00000000-0000-4000-l200-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-l200-000000000001",
      officeId: office.id,
      requesterName: "Pedro Almeida",
      requesterEmail: "pedro@exemplo.com",
      requesterPhone: "(11) 98888-7777",
      cpfCnpj: "987.654.321-00",
      reason:
        "Solicito a exclusão dos meus dados de contato e histórico de triagem, pois não desejo mais manter vínculo com o escritório.",
      status: "PENDING",
      ipAddress: "201.10.20.8",
    },
  });

  const auditSeeds = [
    {
      id: "00000000-0000-4000-u100-000000000001",
      officeId: office.id,
      actorId: admin.id,
      action: "LOGIN" as const,
      entityType: "user",
      entityId: admin.id,
      description: "Login realizado: Administrador",
      ipAddress: "192.168.1.10",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "00000000-0000-4000-u100-000000000002",
      officeId: office.id,
      actorId: admin.id,
      action: "CREATE" as const,
      entityType: "lead",
      entityId: "00000000-0000-4000-b000-000000000001",
      description: "Lead criado: Fernanda Costa",
      metadata: { source: "WEBSITE" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      id: "00000000-0000-4000-u100-000000000003",
      officeId: office.id,
      actorId: admin.id,
      action: "UPLOAD" as const,
      entityType: "document",
      entityId: "00000000-0000-4000-d100-000000000001",
      description: "RG enviado: rg-maria-silva.pdf",
      metadata: { clientId: clients[0].id, documentType: "RG" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
    {
      id: "00000000-0000-4000-u100-000000000004",
      officeId: office.id,
      actorId: admin.id,
      action: "UPDATE" as const,
      entityType: "case",
      entityId: "00000000-0000-4000-d000-000000000001",
      description: "Processo movido no Kanban: Reclamação trabalhista — Maria Silva",
      metadata: { statusName: "Em atendimento" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: "00000000-0000-4000-u100-000000000005",
      officeId: office.id,
      actorId: null,
      action: "LOGIN_FAILED" as const,
      entityType: "session",
      entityId: null,
      description: "Tentativa de login falhou (dashboard)",
      metadata: { identifier: "intruso@exemplo.com", reason: "Credenciais inválidas" },
      ipAddress: "203.0.113.42",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "00000000-0000-4000-u100-000000000006",
      officeId: office.id,
      actorId: admin.id,
      action: "DELETE" as const,
      entityType: "task",
      entityId: "00000000-0000-4000-t000-000000000099",
      description: "Tarefa excluída: Revisar petição inicial",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];

  for (const entry of auditSeeds) {
    await prisma.auditLog.upsert({
      where: { id: entry.id },
      update: {},
      create: entry,
    });
  }

  const mariaPortal = await seedPortalClientUser(
    office.id,
    "00000000-0000-4000-a000-000000000020",
    {
      id: clients[0].id,
      name: clients[0].name,
      cpfCnpj: clients[0].cpfCnpj ?? "123.456.789-00",
    }
  );

  console.log("Seed concluído:", {
    office: office.slug,
    posts: 1,
    lawyers: lawyersData.length,
    clients: clients.length,
    leads: 5,
    cases: cases.length + 2,
    documents: 8,
    appointments: agendaEvents.length,
    tasks: tasksData.length,
    notifications: notificationSeeds.length,
    legalDocuments: legalDocSeeds.length,
    lgpdConsents: 2,
    deletionRequests: 1,
    auditLogs: auditSeeds.length,
    payments: paymentsData.length,
    portal: {
      url: "/portal/acesso",
      cpf: clients[0].cpfCnpj,
      password: PORTAL_DEMO_PASSWORD,
      supabaseSynced: mariaPortal.synced,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
