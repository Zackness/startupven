import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEffectiveUserIdForRequest } from "@/lib/effective-user";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  const effective = await getEffectiveUserIdForRequest();
  if (!effective) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

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
  } = body ?? {};

  if (!date || !title || !platform || !type || !status) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const dateOnly = new Date(`${date}T00:00:00.000Z`);

  const post = await db.editorialPost.findUnique({ where: { id }, select: { userId: true, projectId: true } });
  if (!post) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const canEditByUser = post.userId === effective.userId;
  const canEditByProject = (effective.role === "EDITOR" || effective.role === "ADMIN") && post.projectId != null;
  if (!canEditByUser && !canEditByProject) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const updated = await db.editorialPost.updateMany({
    where: { id },
    data: {
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

  if (updated.count === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const row = await db.editorialPost.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    time: row.time,
    platform: row.platform,
    type: row.type,
    title: row.title,
    caption: row.caption,
    week: row.week,
    format: row.format,
    objective: row.objective,
    cta: row.cta,
    kpi: row.kpi,
    status: row.status,
    link: row.link,
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const effective = await getEffectiveUserIdForRequest();
  if (!effective) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const post = await db.editorialPost.findUnique({ where: { id }, select: { userId: true, projectId: true } });
  if (!post) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const canDeleteByUser = post.userId === effective.userId;
  const canDeleteByProject = (effective.role === "EDITOR" || effective.role === "ADMIN") && post.projectId != null;
  if (!canDeleteByUser && !canDeleteByProject) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const deleted = await db.editorialPost.deleteMany({ where: { id } });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
