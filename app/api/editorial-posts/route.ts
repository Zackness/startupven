import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEffectiveUserIdForRequest } from "@/lib/effective-user";

// Listar y crear publicaciones editoriales.
// Con projectId: calendario del proyecto (EDITOR/ADMIN siempre; cliente solo si está asignado al proyecto).
// Sin projectId: calendario del usuario efectivo (userId).

async function isUserAssignedToProject(userId: string, projectId: string): Promise<boolean> {
  const rows = await db.$queryRaw<{ n: number }[]>`
    SELECT 1 as n FROM \`ProjectUser\` WHERE \`projectId\` = ${projectId} AND \`userId\` = ${userId} LIMIT 1
  `;
  return rows.length > 0;
}

export async function GET(req: Request) {
  const effective = await getEffectiveUserIdForRequest();
  if (!effective) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId")?.trim() || null;

  const isStaff = effective.role === "EDITOR" || effective.role === "ADMIN";
  const canUseProject = projectId && (isStaff || (await isUserAssignedToProject(effective.userId, projectId)));

  if (projectId && !canUseProject) {
    return NextResponse.json({ error: "No tienes acceso a este proyecto" }, { status: 403 });
  }

  const where = canUseProject
    ? { projectId }
    : { userId: effective.userId };

  const rows = await db.editorialPost.findMany({
    where,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      date: r.date.toISOString().slice(0, 10),
      time: r.time,
      platform: r.platform,
      type: r.type,
      title: r.title,
      caption: r.caption,
      week: r.week,
      format: r.format,
      objective: r.objective,
      cta: r.cta,
      kpi: r.kpi,
      status: r.status,
      link: r.link,
    })),
  );
}

export async function POST(req: Request) {
  const effective = await getEffectiveUserIdForRequest();
  if (!effective) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const createdById = effective.currentUserId;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const {
    date,
    time,
    platform,
    type,
    title,
    caption,
    week,
    format,
    objective,
    cta,
    kpi,
    status,
    link,
    projectId: bodyProjectId,
  } = body ?? {};

  if (!date || !title || !platform || !type || !status) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const canUseProject =
    (effective.role === "EDITOR" || effective.role === "ADMIN") &&
    bodyProjectId &&
    typeof bodyProjectId === "string" &&
    bodyProjectId.trim().length > 0;
  const projectIdFromStaff = canUseProject ? bodyProjectId!.trim() : null;

  let projectId: string | null = projectIdFromStaff;
  if (!projectId && bodyProjectId && typeof bodyProjectId === "string" && bodyProjectId.trim().length > 0) {
    const pid = bodyProjectId.trim();
    if (await isUserAssignedToProject(effective.userId, pid)) {
      projectId = pid;
    } else {
      return NextResponse.json({ error: "No tienes acceso a este proyecto" }, { status: 403 });
    }
  }

  const dateOnly = new Date(`${date}T00:00:00.000Z`);

  const created = await db.editorialPost.create({
    data: {
      userId: projectId ? null : effective.userId,
      projectId,
      createdById,
      date: dateOnly,
      time: time ?? null,
      platform,
      type,
      title,
      caption: caption ?? null,
      week: week ?? null,
      format: format ?? null,
      objective: objective ?? null,
      cta: cta ?? null,
      kpi: kpi ?? null,
      status,
      link: link ?? null,
    },
  });

  return NextResponse.json({
    id: created.id,
    date: created.date.toISOString().slice(0, 10),
    time: created.time,
    platform: created.platform,
    type: created.type,
    title: created.title,
    caption: created.caption,
    week: created.week,
    format: created.format,
    objective: created.objective,
    cta: created.cta,
    kpi: created.kpi,
    status: created.status,
    link: created.link,
  });
}
