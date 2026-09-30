import { NextRequest, NextResponse } from "next/server";
import { allPlatforms, getPlatformItems } from "@/config/platforms";
import { getTurso, TursoConfigurationError } from "@/lib/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const validPublicationIds: Map<string, Set<string>> = new Map(
  allPlatforms.map((platform) => [platform.id, new Set(getPlatformItems(platform).map((item) => item.id))]),
);

interface CheckMutation {
  dateKey?: unknown;
  platformId?: unknown;
  publicationId?: unknown;
  checked?: unknown;
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && DATE_PATTERN.test(value);
}

function isValidMutation(value: CheckMutation): value is Required<CheckMutation> & {
  dateKey: string;
  platformId: string;
  publicationId: string;
  checked: boolean;
} {
  return (
    isDateKey(value.dateKey) &&
    typeof value.platformId === "string" &&
    typeof value.publicationId === "string" &&
    typeof value.checked === "boolean" &&
    Boolean(validPublicationIds.get(value.platformId)?.has(value.publicationId))
  );
}

function databaseError(error: unknown) {
  const message = error instanceof TursoConfigurationError
    ? "Configura TURSO_DATABASE_URL y TURSO_AUTH_TOKEN."
    : "No se pudo conectar con Turso.";

  if (!(error instanceof TursoConfigurationError)) console.error("Turso error:", error);
  return NextResponse.json({ error: message }, { status: 503 });
}

export async function GET(request: NextRequest) {
  const dates = [...new Set((request.nextUrl.searchParams.get("dates") ?? "").split(","))]
    .filter(isDateKey)
    .slice(0, 31);

  if (dates.length === 0) {
    return NextResponse.json({ error: "Debes indicar al menos una fecha válida." }, { status: 400 });
  }

  try {
    const database = await getTurso();
    const placeholders = dates.map(() => "?").join(", ");
    const result = await database.execute({
      sql: `
        SELECT date_key, platform_id, publication_id
        FROM publication_checks
        WHERE checked = 1 AND date_key IN (${placeholders})
      `,
      args: dates,
    });

    const records = result.rows.map((row) => ({
      dateKey: String(row.date_key),
      platformId: String(row.platform_id),
      publicationId: String(row.publication_id),
    }));

    return NextResponse.json({ records }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return databaseError(error);
  }
}

export async function PUT(request: NextRequest) {
  let body: CheckMutation;
  try {
    body = (await request.json()) as CheckMutation;
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es válido." }, { status: 400 });
  }

  if (!isValidMutation(body)) {
    return NextResponse.json({ error: "La publicación indicada no es válida." }, { status: 400 });
  }

  try {
    const database = await getTurso();

    if (body.checked) {
      await database.execute({
        sql: `
          INSERT INTO publication_checks (date_key, platform_id, publication_id, checked, updated_at)
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
          ON CONFLICT(date_key, platform_id, publication_id)
          DO UPDATE SET checked = 1, updated_at = CURRENT_TIMESTAMP
        `,
        args: [body.dateKey, body.platformId, body.publicationId],
      });
    } else {
      await database.execute({
        sql: `
          DELETE FROM publication_checks
          WHERE date_key = ? AND platform_id = ? AND publication_id = ?
        `,
        args: [body.dateKey, body.platformId, body.publicationId],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseError(error);
  }
}

export async function DELETE(request: NextRequest) {
  let body: { dateKey?: unknown; platformIds?: unknown };
  try {
    body = (await request.json()) as { dateKey?: unknown; platformIds?: unknown };
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es válido." }, { status: 400 });
  }

  if (!isDateKey(body.dateKey)) {
    return NextResponse.json({ error: "La fecha indicada no es válida." }, { status: 400 });
  }

  const platformIds = Array.isArray(body.platformIds)
    ? [...new Set(body.platformIds.filter((id): id is string => typeof id === "string" && validPublicationIds.has(id)))]
    : [];

  if (Array.isArray(body.platformIds) && platformIds.length !== body.platformIds.length) {
    return NextResponse.json({ error: "Las plataformas indicadas no son válidas." }, { status: 400 });
  }

  try {
    const database = await getTurso();
    if (platformIds.length > 0) {
      const placeholders = platformIds.map(() => "?").join(", ");
      await database.execute({
        sql: `DELETE FROM publication_checks WHERE date_key = ? AND platform_id IN (${placeholders})`,
        args: [body.dateKey, ...platformIds],
      });
    } else {
      await database.execute({
        sql: "DELETE FROM publication_checks WHERE date_key = ?",
        args: [body.dateKey],
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseError(error);
  }
}
