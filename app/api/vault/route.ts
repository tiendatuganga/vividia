import { NextRequest, NextResponse } from "next/server";
import { getTurso, TursoConfigurationError } from "@/lib/turso";
import type { VaultConfiguration } from "@/types/credential";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function databaseError(error: unknown) {
  const message = error instanceof TursoConfigurationError
    ? "Turso no está configurado."
    : "No se pudo acceder a la bóveda.";
  if (!(error instanceof TursoConfigurationError)) console.error("Vault database error:", error);
  return NextResponse.json({ error: message }, { status: 503 });
}

function isConfiguration(value: unknown): value is VaultConfiguration {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<VaultConfiguration>;
  return (
    typeof config.salt === "string" && config.salt.length <= 256 &&
    typeof config.verifierCiphertext === "string" && config.verifierCiphertext.length <= 1024 &&
    typeof config.verifierIv === "string" && config.verifierIv.length <= 256 &&
    typeof config.kdfIterations === "number" &&
    config.kdfIterations >= 100_000 && config.kdfIterations <= 2_000_000
  );
}

export async function GET() {
  try {
    const database = await getTurso();
    const result = await database.execute(`
      SELECT salt, verifier_ciphertext, verifier_iv, kdf_iterations
      FROM vault_settings WHERE id = 1
    `);
    const row = result.rows[0];
    const configuration = row ? {
      salt: String(row.salt),
      verifierCiphertext: String(row.verifier_ciphertext),
      verifierIv: String(row.verifier_iv),
      kdfIterations: Number(row.kdf_iterations),
    } : null;
    return NextResponse.json({ configuration }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return databaseError(error);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Configuración no válida." }, { status: 400 });
  }

  if (!isConfiguration(body)) {
    return NextResponse.json({ error: "Configuración no válida." }, { status: 400 });
  }

  try {
    const database = await getTurso();
    const existing = await database.execute("SELECT id FROM vault_settings WHERE id = 1");
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "La bóveda ya está configurada." }, { status: 409 });
    }

    await database.execute({
      sql: `INSERT INTO vault_settings
        (id, salt, verifier_ciphertext, verifier_iv, kdf_iterations)
        VALUES (1, ?, ?, ?, ?)`,
      args: [body.salt, body.verifierCiphertext, body.verifierIv, body.kdfIterations],
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return databaseError(error);
  }
}

export async function DELETE() {
  try {
    const database = await getTurso();
    await database.execute("DELETE FROM vault_settings WHERE id = 1");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseError(error);
  }
}
